import json
import math
import hashlib
import logging
import traceback
import mysql.connector
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
from groq import Groq
from django.conf import settings
import threading

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# DB
# ─────────────────────────────────────────────

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="theanimesh2005",
        database="fieldscope_db"
    )


# ─────────────────────────────────────────────
# AUTH HELPERS
# ─────────────────────────────────────────────

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def landing_page(request):
    return render(request, "index.html")


# ─────────────────────────────────────────────
# AUTH VIEWS
# ─────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["POST"])
def signup(request):
    try:
        data = json.loads(request.body)
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return JsonResponse({"error": "All fields required"}, status=400)

        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close(); conn.close()
            return JsonResponse({"error": "Email already registered"}, status=409)

        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
            (name, email, hash_password(password))
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.close(); conn.close()

        request.session["user_id"] = user_id
        request.session["user_name"] = name
        return JsonResponse({"id": user_id, "name": name, "email": email, "is_new": True}, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, name, email FROM users WHERE email = %s AND password_hash = %s",
            (email, hash_password(password))
        )
        user = cursor.fetchone()

        has_assessment = False
        if user:
            cursor.execute("SELECT id FROM assessments WHERE user_id = %s LIMIT 1", (user["id"],))
            has_assessment = bool(cursor.fetchone())

        cursor.close(); conn.close()

        if not user:
            return JsonResponse({"error": "Invalid email or password"}, status=401)

        request.session["user_id"] = user["id"]
        request.session["user_name"] = user["name"]
        return JsonResponse({**user, "has_assessment": has_assessment})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@require_http_methods(["GET"])
def me(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Not logged in"}, status=401)
    return JsonResponse({"id": user_id, "name": request.session.get("user_name")})


# ─────────────────────────────────────────────
# SCORING ENGINE
# ─────────────────────────────────────────────

TEAM_SIZE_MAP = {
    "solo": 1, "1": 1,
    "2-5": 3,  "2–5": 3,
    "6-15": 10, "6–15": 10,
    "15+": 20,
}

TIER_SCORE_MAP = {"metro": 100, "tier2": 60, "rural": 30}

SKILL_WEIGHTS = {
    "analytics": 10, "automation": 10,
    "seo": 8, "paid ads": 8, "sales": 8,
    "design": 7, "content": 6, "video": 6,
}


def safe_int(value, default=0):
    try:
        return int(float(str(value).replace(",", "").replace("₹", "").strip()))
    except (ValueError, TypeError):
        return default


def normalize_team_size(raw):
    return TEAM_SIZE_MAP.get(str(raw).lower().strip(), 1)


def normalize_skills(raw):
    if isinstance(raw, list):
        return [str(s).strip().lower() for s in raw if s]
    try:
        return [str(s).strip().lower() for s in json.loads(raw) if s]
    except Exception:
        return []


def _score_budget(capital, revenue):
    c = min(math.log10(capital + 1) / math.log10(5_000_000) * 15, 15)
    r = min(math.log10(revenue + 1) / math.log10(5_000_000) * 15, 15)
    return round(c + r, 2)


def _score_team(team_size):
    if team_size >= 15: return 20.0
    if team_size >= 6:  return 14.0
    if team_size >= 2:  return 8.0
    return 3.0


def _score_clients(clients):
    if clients >= 50: return 20.0
    if clients >= 20: return 15.0
    if clients >= 5:  return 10.0
    if clients >= 1:  return 5.0
    return 0.0


def _score_experience(years):
    if years >= 7: return 15.0
    if years >= 4: return 11.0
    if years >= 2: return 7.0
    if years >= 1: return 3.0
    return 0.0


def _score_skills(skills):
    if not skills: return 0.0
    return round(min(len(skills) * 3.5, 10.0), 2)


def _score_location(tier):
    return round(TIER_SCORE_MAP.get(tier, 30) / 100 * 5, 2)


def compute_capability_score(capital, revenue, clients, team_size, years, skills, tier):
    return round(min(max(
        _score_budget(capital, revenue)
        + _score_team(team_size)
        + _score_clients(clients)
        + _score_experience(years)
        + _score_skills(skills)
        + _score_location(tier),
    0), 100), 2)


def classify_level(score):
    if score >= 70: return "Enterprise"
    if score >= 40: return "Intermediate"
    return "Beginner"


def derive_confidence(score):
    return round(min(max(50 + (score / 100) * 47, 50), 97))


# ─────────────────────────────────────────────
# ASSESSMENT VIEW
# ─────────────────────────────────────────────

REQUIRED_FIELDS = ["domain", "capital", "revenue", "clients", "teamSize", "skills", "tier"]


@csrf_exempt
@require_http_methods(["POST"])
def submit_assessment(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        return JsonResponse({"error": "Invalid JSON.", "detail": str(e)}, status=400)

    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    missing = [f for f in REQUIRED_FIELDS if f not in data or data[f] in (None, "", [])]
    if missing:
        return JsonResponse({"error": "Missing fields.", "fields": missing}, status=422)

    capital          = safe_int(data.get("capital"))
    revenue          = safe_int(data.get("revenue"))
    clients          = safe_int(data.get("clients"))
    years_experience = safe_int(data.get("years_experience", 0))
    team_size        = normalize_team_size(data.get("teamSize", "solo"))
    skills           = normalize_skills(data.get("skills", []))
    tier             = str(data.get("tier", "")).strip().lower()
    domain           = str(data.get("domain", "")).strip()

    capability_score = compute_capability_score(capital, revenue, clients, team_size, years_experience, skills, tier)
    business_level   = classify_level(capability_score)
    confidence       = derive_confidence(capability_score)

    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO assessments (
                user_id, domain,
                capital, revenue, clients, years_experience,
                team_size, skills, tier,
                capability_score, business_level
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (user_id, domain, capital, revenue, clients, years_experience,
             team_size, json.dumps(skills), tier, capability_score, business_level),
        )
        conn.commit()
        assessment_id = cursor.lastrowid
    except Exception as e:
        logger.exception("DB insert failed for user_id=%s", user_id)
        return JsonResponse({"error": "Database error.", "detail": str(e)}, status=500)
    finally:
        try: cursor.close(); conn.close()
        except Exception: pass

    # ── Auto-generate personalized industries in background ──
    threading.Thread(
        target=_generate_and_cache_industries,
        args=(user_id, {
            "id":               assessment_id,
            "domain":           domain,
            "business_level":   business_level,
            "capability_score": capability_score,
            "skills":           skills,
            "tier":             tier,
            "team_size":        team_size,
            "capital":          capital,
            "revenue":          revenue,
            "clients":          clients,
        }),
        daemon=True,
    ).start()

    return JsonResponse({
        "id":         assessment_id,
        "level":      business_level,
        "confidence": confidence,
        "domain":     domain,
        "score":      capability_score,
        "breakdown": {
            "budget":     _score_budget(capital, revenue),
            "team":       _score_team(team_size),
            "clients":    _score_clients(clients),
            "experience": _score_experience(years_experience),
            "skills":     _score_skills(skills),
            "location":   _score_location(tier),
        },
    }, status=201)


# ─────────────────────────────────────────────
# OTHER VIEWS
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def landing_stats(request):
    return JsonResponse({"industries": 15, "business_levels": 3, "ai_features": 16, "revenue_potential": "₹50L+"})


@require_http_methods(["GET"])
def dashboard_data(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Not logged in"}, status=401)

    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT name FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        # FIX: added capability_score so roadmap score banner works
        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("""
                SELECT domain, business_level, capability_score,
                       team_size, capital, revenue, clients, tier, skills, confidence
                FROM assessments WHERE user_id = %s AND id = %s
            """, (user_id, hist_id))
        else:
            cursor.execute("""
                SELECT domain, business_level, capability_score,
                       team_size, capital, revenue, clients, tier, skills, confidence
                FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1
            """, (user_id,))
        assessment = cursor.fetchone()

        cursor.close(); conn.close()

        if assessment and assessment.get("skills"):
            try:
                assessment["skills"] = json.loads(assessment["skills"])
            except Exception:
                assessment["skills"] = []

        return JsonResponse({
            "name":       user["name"] if user else "User",
            "assessment": assessment,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@require_http_methods(["GET"])
def assessment_history(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Not logged in"}, status=401)

    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, domain, business_level, capability_score, confidence, created_at
            FROM assessments 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (user_id,))
        history = cursor.fetchall()

        cursor.close(); conn.close()

        # Format dates as strings
        for entry in history:
            if entry.get("created_at"):
                entry["created_at"] = entry["created_at"].isoformat()

        return JsonResponse({"history": history})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


# ─────────────────────────────────────────────
# GROQ AI VIEWS
# ─────────────────────────────────────────────

def get_groq_client():
    return Groq(api_key=settings.GROQ_API_KEY)


def parse_groq_json(raw):
    """Safely strip markdown fences and parse JSON from Groq response."""
    raw = raw.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


# ─────────────────────────────────────────────
# RECOMMENDATIONS — cached per assessment
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def get_recommendations(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    tier_labels = {"metro": "Metro Ready", "tier2": "Tier-2 Ready", "rural": "Local Market"}

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("""
                SELECT id, domain, business_level, capability_score, skills, tier,
                       team_size, capital, revenue, clients, ai_recommendations
                FROM assessments WHERE user_id = %s AND id = %s
            """, (user_id, hist_id))
        else:
            cursor.execute("""
                SELECT id, domain, business_level, capability_score, skills, tier,
                       team_size, capital, revenue, clients, ai_recommendations
                FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1
            """, (user_id,))
        a = cursor.fetchone()
        cursor.close(); conn.close()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    if not a:
        return JsonResponse({"error": "No assessment found."}, status=404)

    # ── Return cached if already exists ──
    if a.get("ai_recommendations"):
        cached = a["ai_recommendations"]
        if isinstance(cached, str):
            cached = json.loads(cached)
        return JsonResponse({
            "recommendations": cached,
            "domain":          a["domain"],
            "level":           a["business_level"],
            "score":           a["capability_score"],
            "tier_label":      tier_labels.get(a["tier"], "Ready"),
            "cached":          True,
        })

    # ── Generate fresh from Groq ──
    prompt = f"""
You are a business growth advisor for Indian entrepreneurs.

Business Profile:
- Industry: {a['domain']}
- Level: {a['business_level']} (Score: {a['capability_score']}/100)
- Skills: {a['skills']}
- Team Size: {a['team_size']} people
- Location: {a['tier']}
- Monthly Capital: ₹{a['capital']}
- Monthly Revenue: ₹{a['revenue']}
- Active Clients: {a['clients']}

Give exactly 5 specific, actionable recommendations.
Respond ONLY with a JSON array, no extra text:
[{{"title": "", "action": "", "priority": "high|medium|low", "impact": ""}}]
"""

    try:
        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024,
        )
        raw = chat.choices[0].message.content.strip()
        recommendations = parse_groq_json(raw)
    except Exception as e:
        logger.error(traceback.format_exc())
        return JsonResponse({"error": "Groq error.", "detail": str(e)}, status=502)

    # ── Cache to DB ──
    try:
        conn2 = get_db()
        cur2  = conn2.cursor()
        cur2.execute(
            "UPDATE assessments SET ai_recommendations = %s WHERE id = %s",
            (json.dumps(recommendations), a["id"])
        )
        conn2.commit()
        cur2.close(); conn2.close()
    except Exception:
        pass  # don't fail the request if cache save fails

    return JsonResponse({
        "recommendations": recommendations,
        "domain":          a["domain"],
        "level":           a["business_level"],
        "score":           a["capability_score"],
        "tier_label":      tier_labels.get(a["tier"], "Ready"),
        "cached":          False,
    })


# ─────────────────────────────────────────────
# ROADMAP — cached per assessment
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def generate_roadmap(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("""
                SELECT id, domain, business_level, capability_score, skills, tier,
                       team_size, ai_roadmap
                FROM assessments WHERE user_id = %s AND id = %s
            """, (user_id, hist_id))
        else:
            cursor.execute("""
                SELECT id, domain, business_level, capability_score, skills, tier,
                       team_size, ai_roadmap
                FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1
            """, (user_id,))
        a = cursor.fetchone()
        cursor.close(); conn.close()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    if not a:
        return JsonResponse({"error": "No assessment found."}, status=404)

    # ── Return cached if already exists ──
    if a.get("ai_roadmap"):
        cached = a["ai_roadmap"]
        if isinstance(cached, str):
            cached = json.loads(cached)
        return JsonResponse({
            "roadmap": cached,
            "domain":  a["domain"],
            "level":   a["business_level"],
            
            "cached":  True,
        })

    # ── Generate fresh from Groq ──
    prompt = f"""
You are a business roadmap strategist for Indian entrepreneurs.

Business Profile:
- Industry: {a['domain']}
- Level: {a['business_level']} (Score: {a['capability_score']}/100)
- Skills: {a['skills']}
- Team Size: {a['team_size']} people
- Location: {a['tier']}

Create a 4-week actionable growth roadmap.
Respond ONLY with a JSON array, no extra text:
[{{"week": 1, "title": "", "focus": "", "tasks": ["", "", ""], "goal": ""}}]
"""

    try:
        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024,
        )
        raw = chat.choices[0].message.content.strip()
        roadmap = parse_groq_json(raw)
    except Exception as e:
        logger.error(traceback.format_exc())
        return JsonResponse({"error": "Groq error.", "detail": str(e)}, status=502)

    # ── Cache to DB ──
    try:
        conn2 = get_db()
        cur2  = conn2.cursor()
        cur2.execute(
            "UPDATE assessments SET ai_roadmap = %s WHERE id = %s",
            (json.dumps(roadmap), a["id"])
        )
        conn2.commit()
        cur2.close(); conn2.close()
    except Exception:
        pass

    return JsonResponse({
        "roadmap": roadmap,
        "domain":  a["domain"],
        "level":   a["business_level"],
        "cached":  False,
    })


# ─────────────────────────────────────────────
# ASSESSMENT HISTORY
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def assessment_history(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, domain, business_level, capability_score,
                   ai_recommendations, created_at
            FROM assessments WHERE user_id = %s ORDER BY created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        cursor.close(); conn.close()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    for r in rows:
        if r["ai_recommendations"] and isinstance(r["ai_recommendations"], str):
            try:
                r["ai_recommendations"] = json.loads(r["ai_recommendations"])
            except Exception:
                r["ai_recommendations"] = None
        if r["created_at"]:
            r["created_at"] = r["created_at"].isoformat()

    return JsonResponse({"history": rows})


# ─────────────────────────────────────────────
# INDUSTRY VIEWS
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def get_industries(request):
    """
    Returns all active industries joined with cached Groq market data.
    If market data is missing for any industry, triggers a background
    Groq enrichment so the next request gets real data.
    """
    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                i.slug, i.name, i.emoji, i.description,
                i.levels, i.color, i.coming_soon,
                m.market_size, m.growth, m.tags
            FROM industries i
            LEFT JOIN industry_market_data m ON m.industry_slug = i.slug
            WHERE i.is_active = 1
            ORDER BY i.sort_order ASC
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    industries = []
    missing_slugs = []

    for r in rows:
        # Parse JSON fields from DB
        try:
            levels = json.loads(r["levels"]) if isinstance(r["levels"], str) else r["levels"]
        except Exception:
            levels = []

        try:
            tags = json.loads(r["tags"]) if isinstance(r["tags"], str) else (r["tags"] or [])
        except Exception:
            tags = []

        industries.append({
            "slug":        r["slug"],
            "name":        r["name"],
            "emoji":       r["emoji"],
            "description": r["description"],
            "levels":      levels,
            "color":       r["color"],
            "comingSoon":  bool(r["coming_soon"]),
            "marketSize":  r["market_size"] or "Fetching…",
            "growth":      r["growth"]      or "Fetching…",
            "tags":        tags,
        })

        # Track which slugs need Groq enrichment
        if not r["market_size"]:
            missing_slugs.append(r["slug"])

    # Fire enrichment in background — won't block this response
    if missing_slugs:
        threading.Thread(
            target=_enrich_industries_background,
            args=(missing_slugs,),
            daemon=True,
        ).start()

    return JsonResponse({"industries": industries})


def _enrich_industries_background(slugs: list):
    """
    Called in a background thread.
    Fetches Groq-generated market data for each slug and caches it.
    """
    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT slug, name, description FROM industries WHERE slug IN (%s)"
            % ",".join(["%s"] * len(slugs)),
            slugs
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
    except Exception as e:
        logger.error("Background enrichment DB fetch failed: %s", e)
        return

    for row in rows:
        try:
            _enrich_single_industry(row["slug"], row["name"], row["description"])
        except Exception as e:
            logger.error("Enrichment failed for %s: %s", row["slug"], e)


def _enrich_single_industry(slug: str, name: str, description: str):
    """
    Calls Groq for one industry and upserts into industry_market_data.
    """
    prompt = f"""
You are a market research analyst specializing in Indian business sectors.

Industry: {name}
Description: {description}

Provide current Indian market data for this industry.
Respond ONLY with a single JSON object, no extra text:
{{
  "market_size": "<value in ₹ Cr or ₹ Lakh Cr, e.g. '₹32,000 Cr'>",
  "growth": "<YoY growth rate, e.g. '+28% YoY'>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}}

Tags should be short 2-3 word labels like: "High Growth", "Low Capital", "Remote Friendly", "Capital Intensive", etc.
"""

    chat = get_groq_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=256,
    )
    raw  = chat.choices[0].message.content.strip()
    data = parse_groq_json(raw)

    market_size = str(data.get("market_size", ""))
    growth      = str(data.get("growth", ""))
    tags        = json.dumps(data.get("tags", []))

    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO industry_market_data (industry_slug, market_size, growth, tags, raw_response)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            market_size  = VALUES(market_size),
            growth       = VALUES(growth),
            tags         = VALUES(tags),
            raw_response = VALUES(raw_response),
            generated_at = CURRENT_TIMESTAMP
    """, (slug, market_size, growth, tags, raw))
    conn.commit()
    cursor.close()
    conn.close()
    logger.info("Enriched industry: %s → %s / %s", slug, market_size, growth)


# ─────────────────────────────────────────────
# FORCE REFRESH (optional admin endpoint)
# Hit GET /industries/refresh/ to wipe cache and re-fetch all from Groq
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def refresh_industry_data(request):
    """Wipes cached market data so Groq re-enriches on next /industries/ call."""
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM industry_market_data")
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Cache cleared. Next /industries/ call will re-enrich from Groq."})



TIER_LABELS = {
    "metro": "Metro City (Mumbai / Delhi / Bangalore / Chennai)",
    "tier2": "Tier-2 City (Pune / Surat / Jaipur / Coimbatore)",
    "rural": "Rural / Town (Sub-district & rural markets)",
}

INDUSTRY_PROMPT = """
You are a business opportunity advisor for Indian entrepreneurs.

User Profile:
- Location Tier: {tier} ({tier_label})
- Current Domain: {domain}
- Business Level: {level} (Score: {score}/100)
- Monthly Capital: ₹{capital}
- Monthly Revenue: ₹{revenue}
- Active Clients: {clients}
- Team Size: {team_size} people
- Skills: {skills}

Based on this exact profile, generate 6 to 8 industry opportunities that are:
1. Realistic given their capital and skill level
2. Relevant to their location tier ({tier_label})
3. Either adjacent to their current domain OR high-potential new opportunities
4. Sorted by best fit first

Respond ONLY with a JSON array, no extra text, no markdown:
[
  {{
    "slug": "unique-slug",
    "name": "Industry Name",
    "emoji": "single emoji",
    "description": "One line describing what this covers",
    "marketSize": "₹XX,XXX Cr",
    "growth": "+XX% YoY",
    "levels": ["Entry Level", "Mid Level", "Expert Level"],
    "tags": ["Tag1", "Tag2", "Tag3"],
    "color": "#hexcolor",
    "whyForYou": "One sentence explaining why this fits this user specifically",
    "comingSoon": false
  }}
]

Use distinct hex colors per industry. Mix warm and cool tones.
"""

GLOBAL_INDUSTRY_PROMPT = """
You are a business opportunity advisor for Indian entrepreneurs.

Generate 8 popular high-growth industry opportunities in India for 2025,
suitable for a general audience across all skill levels and locations.

Respond ONLY with a JSON array, no extra text, no markdown:
[
  {{
    "slug": "unique-slug",
    "name": "Industry Name",
    "emoji": "single emoji",
    "description": "One line describing what this covers",
    "marketSize": "₹XX,XXX Cr",
    "growth": "+XX% YoY",
    "levels": ["Entry Level", "Mid Level", "Expert Level"],
    "tags": ["Tag1", "Tag2", "Tag3"],
    "color": "#hexcolor",
    "whyForYou": "Top growth opportunity in India for 2025",
    "comingSoon": false
  }}
]
"""


@require_http_methods(["GET"])
def get_personalized_industries(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("""
                SELECT id, domain, business_level, capability_score,
                       skills, tier, team_size, capital, revenue, clients
                FROM assessments
                WHERE user_id = %s AND id = %s
            """, (user_id, hist_id))
        else:
            cursor.execute("""
                SELECT id, domain, business_level, capability_score,
                       skills, tier, team_size, capital, revenue, clients
                FROM assessments
                WHERE user_id = %s ORDER BY created_at DESC LIMIT 1
            """, (user_id,))
        assessment = cursor.fetchone()

        if not assessment:
            return _get_or_generate_global(cursor, conn)

        assessment_id = assessment["id"]

        cursor.execute("""
            SELECT industries FROM user_industries
            WHERE user_id = %s AND assessment_id = %s
        """, (user_id, assessment_id))
        cached = cursor.fetchone()
        cursor.close()
        conn.close()

    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    if cached:
        try:
            return JsonResponse({
                "industries":  json.loads(cached["industries"]),
                "personalized": True,
                "cached":       True,
            })
        except Exception:
            pass

    # Not cached yet — fire background generation, return generating state
    threading.Thread(
        target=_generate_and_cache_industries,
        args=(user_id, assessment),
        daemon=True,
    ).start()

    return JsonResponse({
        "industries": [],
        "personalized": True,
        "cached":       False,
        "generating":   True,
    })


@require_http_methods(["GET"])
def refresh_personalized_industries(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)
        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("SELECT id FROM assessments WHERE user_id = %s AND id = %s", (user_id, hist_id))
        else:
            cursor.execute("SELECT id FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (user_id,))
        row = cursor.fetchone()
        if row:
            cursor.execute("""
                DELETE FROM user_industries
                WHERE user_id = %s AND assessment_id = %s
            """, (user_id, row["id"]))
            conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Cache cleared. Fetching fresh industries."})


def _generate_and_cache_industries(user_id: int, assessment: dict):
    try:
        skills = assessment.get("skills", "[]")
        if isinstance(skills, str):
            try:
                skills = json.loads(skills)
            except Exception:
                skills = []

        tier       = str(assessment.get("tier", "metro")).lower()
        tier_label = TIER_LABELS.get(tier, "India")

        prompt = INDUSTRY_PROMPT.format(
            tier=tier,
            tier_label=tier_label,
            domain=assessment.get("domain", "General"),
            level=assessment.get("business_level", "Beginner"),
            score=assessment.get("capability_score", 0),
            capital=assessment.get("capital", 0),
            revenue=assessment.get("revenue", 0),
            clients=assessment.get("clients", 0),
            team_size=assessment.get("team_size", 1),
            skills=", ".join(skills) if skills else "None listed",
        )

        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=2048,
        )
        raw          = chat.choices[0].message.content.strip()
        industries   = parse_groq_json(raw)

        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_industries (user_id, assessment_id, industries)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                industries   = VALUES(industries),
                generated_at = CURRENT_TIMESTAMP
        """, (user_id, assessment["id"], json.dumps(industries)))
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Personalized industries generated for user_id=%s", user_id)

    except Exception:
        logger.error("Industry generation failed for user_id=%s: %s", user_id, traceback.format_exc())


def _get_or_generate_global(cursor, conn):
    try:
        cursor.execute("""
            SELECT industries FROM global_industries
            ORDER BY generated_at DESC LIMIT 1
        """)
        row = cursor.fetchone()
        cursor.close()
        conn.close()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    if row:
        try:
            return JsonResponse({
                "industries":   json.loads(row["industries"]),
                "personalized": False,
                "cached":       True,
            })
        except Exception:
            pass

    threading.Thread(target=_generate_and_cache_global, daemon=True).start()

    return JsonResponse({
        "industries":  [],
        "personalized": False,
        "cached":       False,
        "generating":   True,
    })


def _generate_and_cache_global():
    try:
        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": GLOBAL_INDUSTRY_PROMPT}],
            temperature=0.5,
            max_tokens=2048,
        )
        raw        = chat.choices[0].message.content.strip()
        industries = parse_groq_json(raw)

        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO global_industries (industries) VALUES (%s)",
            (json.dumps(industries),)
        )
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Global fallback industries generated.")

    except Exception:
        logger.error("Global industry generation failed: %s", traceback.format_exc())


INDUSTRY_DETAIL_PROMPT = """
You are a senior business analyst specializing in Indian markets.

User Profile:
- Location Tier: {tier_label}
- Current Domain: {domain}
- Business Level: {level} (Score: {score}/100)
- Monthly Capital: ₹{capital}
- Monthly Revenue: ₹{revenue}
- Skills: {skills}

Industry to analyze: {industry_name}

Generate a comprehensive industry analysis personalized to this user.
Respond ONLY with a single JSON object, no extra text, no markdown:

{{
  "name": "{industry_name}",
  "tagline": "One punchy line describing this industry's opportunity in India",
  "overview": "3-4 sentences on market opportunity, current state, and why now is the right time in India",
  "marketSize": "₹XX,XXX Cr",
  "growth": "+XX% YoY",
  "levels": [
    {{
      "name": "Level name",
      "description": "What this level looks like",
      "capitalNeeded": "₹X,XXX - ₹XX,XXX",
      "timeToReach": "X-X months",
      "keyMilestone": "The one thing that defines this level"
    }}
  ],
  "topPlayers": [
    {{
      "name": "Company name",
      "type": "Startup | Enterprise | MNC",
      "note": "One line about what they do / why relevant"
    }}
  ],
  "revenuePotential": [
    {{
      "level": "Level name",
      "monthly": "₹X,XXX - ₹XX,XXX",
      "annual": "₹X.X L - ₹XX L"
    }}
  ],
  "forYou": "2-3 sentences specifically about why this industry fits THIS user's profile, skills, location and capital"
}}

Generate exactly 3 levels, 5 top players, and 3 revenue tiers.
"""


@require_http_methods(["GET"])
def get_industry_detail(request, slug):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    # ── Check cache first ──
    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT detail FROM industry_detail_cache
            WHERE user_id = %s AND industry_slug = %s
        """, (user_id, slug))
        cached = cursor.fetchone()

        if cached:
            cursor.close(); conn.close()
            return JsonResponse({
                "detail":   json.loads(cached["detail"]),
                "cached":   True,
                "slug":     slug,
            })

        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("""
                SELECT domain, business_level, capability_score,
                       skills, tier, capital, revenue
                FROM assessments
                WHERE user_id = %s AND id = %s
            """, (user_id, hist_id))
        else:
            cursor.execute("""
                SELECT domain, business_level, capability_score,
                       skills, tier, capital, revenue
                FROM assessments
                WHERE user_id = %s ORDER BY created_at DESC LIMIT 1
            """, (user_id,))
        assessment = cursor.fetchone()
        cursor.close(); conn.close()

    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    # ── Build industry name from slug ──
    industry_name = slug.replace("-", " ").title()

    # ── If no assessment, use defaults ──
    if assessment:
        skills = assessment.get("skills", "[]")
        if isinstance(skills, str):
            try: skills = json.loads(skills)
            except Exception: skills = []
        tier       = str(assessment.get("tier", "metro")).lower()
        tier_label = TIER_LABELS.get(tier, "India")
        domain     = assessment.get("domain", "General")
        level      = assessment.get("business_level", "Beginner")
        score      = assessment.get("capability_score", 0)
        capital    = assessment.get("capital", 0)
        revenue    = assessment.get("revenue", 0)
    else:
        skills, tier_label, domain = [], "India", "General"
        level, score, capital, revenue = "Beginner", 0, 0, 0

    prompt = INDUSTRY_DETAIL_PROMPT.format(
        tier_label=tier_label,
        domain=domain,
        level=level,
        score=score,
        capital=capital,
        revenue=revenue,
        skills=", ".join(skills) if skills else "None listed",
        industry_name=industry_name,
    )

    # ── Call Groq ──
    try:
        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=2048,
        )
        raw    = chat.choices[0].message.content.strip()
        detail = parse_groq_json(raw)
    except Exception as e:
        logger.error(traceback.format_exc())
        return JsonResponse({"error": "Groq error.", "detail": str(e)}, status=502)

    # ── Cache to DB ──
    try:
        conn2   = get_db()
        cursor2 = conn2.cursor()
        cursor2.execute("""
            INSERT INTO industry_detail_cache (user_id, industry_slug, detail)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                detail       = VALUES(detail),
                generated_at = CURRENT_TIMESTAMP
        """, (user_id, slug, json.dumps(detail)))
        conn2.commit()
        cursor2.close(); conn2.close()
    except Exception:
        pass

    return JsonResponse({
        "detail": detail,
        "cached": False,
        "slug":   slug,
    })


@require_http_methods(["GET"])
def refresh_industry_detail(request, slug):
    """Wipe cache for one industry so it regenerates fresh on next visit."""
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM industry_detail_cache
            WHERE user_id = %s AND industry_slug = %s
        """, (user_id, slug))
        conn.commit()
        cursor.close(); conn.close()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"message": "Cache cleared."})




# ─────────────────────────────────────────────
# ROADMAP TASK PROGRESS — save & fetch
# Add these two views to your existing views.py
# ─────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["POST"])
def save_task_progress(request):
    """
    Toggle a single task's completion state.
    Body: { week_index: int, task_index: int, completed: bool }
    """
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    week_index  = data.get("week_index")
    task_index  = data.get("task_index")
    completed   = bool(data.get("completed", True))

    if week_index is None or task_index is None:
        return JsonResponse({"error": "week_index and task_index required."}, status=422)

    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("SELECT id FROM assessments WHERE user_id = %s AND id = %s", (user_id, hist_id))
        else:
            cursor.execute("SELECT id FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (user_id,))
        row = cursor.fetchone()
        if not row:
            cursor.close(); conn.close()
            return JsonResponse({"error": "No assessment found."}, status=404)

        assessment_id = row["id"]

        if completed:
            cursor.execute("""
                INSERT INTO roadmap_task_progress
                    (user_id, assessment_id, week_index, task_index, completed)
                VALUES (%s, %s, %s, %s, 1)
                ON DUPLICATE KEY UPDATE completed = 1, completed_at = CURRENT_TIMESTAMP
            """, (user_id, assessment_id, week_index, task_index))
        else:
            cursor.execute("""
                DELETE FROM roadmap_task_progress
                WHERE user_id = %s AND assessment_id = %s
                  AND week_index = %s AND task_index = %s
            """, (user_id, assessment_id, week_index, task_index))

        conn.commit()
        cursor.close(); conn.close()

    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    return JsonResponse({"saved": True, "completed": completed})


@require_http_methods(["GET"])
def get_task_progress(request):
    """
    Returns all completed tasks for the user's latest assessment.
    Response: { progress: [ {week_index, task_index}, ... ], assessment_id: int }
    """
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("SELECT id FROM assessments WHERE user_id = %s AND id = %s", (user_id, hist_id))
        else:
            cursor.execute("SELECT id FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (user_id,))
        row = cursor.fetchone()
        if not row:
            cursor.close(); conn.close()
            return JsonResponse({"progress": [], "assessment_id": None})

        assessment_id = row["id"]

        cursor.execute("""
            SELECT week_index, task_index FROM roadmap_task_progress
            WHERE user_id = %s AND assessment_id = %s AND completed = 1
            ORDER BY week_index, task_index
        """, (user_id, assessment_id))
        rows = cursor.fetchall()
        cursor.close(); conn.close()

    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    return JsonResponse({
        "progress":      [{"week_index": r["week_index"], "task_index": r["task_index"]} for r in rows],
        "assessment_id": assessment_id,
    })

# ─────────────────────────────────────────────
# AI ADVISOR (CHAT)
# ─────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["POST"])
def chat_advisor(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)
        
    try:
        data = json.loads(request.body)
        message = data.get("message", "").strip()
        hist_id = data.get("id")
    except Exception as e:
        return JsonResponse({"error": "Invalid request.", "detail": str(e)}, status=400)

    if not message:
        return JsonResponse({"error": "Message is empty."}, status=400)

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        if hist_id:
            cursor.execute('''
                SELECT id, domain, business_level, capability_score, skills, tier,
                       team_size, capital, revenue, clients
                FROM assessments WHERE user_id = %s AND id = %s
            ''', (user_id, hist_id))
        else:
            cursor.execute('''
                SELECT id, domain, business_level, capability_score, skills, tier,
                       team_size, capital, revenue, clients
                FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1
            ''', (user_id,))
        a = cursor.fetchone()
        cursor.close()
        conn.close()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    if not a:
        return JsonResponse({"error": "No assessment found."}, status=404)

    prompt = f"""
You are the FieldScope AI Business Advisor, an expert consultant for Indian entrepreneurs.
Your client's business profile:
- Industry: {a['domain']}
- Level: {a['business_level']} (Score: {a['capability_score']}/100)
- Skills: {a['skills']}
- Team Size: {a['team_size']} people
- Location: {a['tier']}
- Monthly Capital: ₹{a['capital']}
- Monthly Revenue: ₹{a['revenue']}
- Active Clients: {a['clients']}

The client asks: "{message}"

Provide a concise, practical, and highly relevant answer based on their specific profile and the Indian market context. Limit your response to 2-3 paragraphs.
"""
    try:
        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024
        )
        reply = chat.choices[0].message.content.strip()
    except Exception as e:
        logger.error(traceback.format_exc())
        return JsonResponse({"error": "Groq error.", "detail": str(e)}, status=502)

    return JsonResponse({"reply": reply})


# ─────────────────────────────────────────────
# MARKET INTELLIGENCE
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def get_market_intelligence(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Unauthorized."}, status=401)
        
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute('''
                SELECT id, domain, business_level, capability_score, skills, tier,
                       team_size, capital, revenue, clients
                FROM assessments WHERE user_id = %s AND id = %s
            ''', (user_id, hist_id))
        else:
            cursor.execute('''
                SELECT id, domain, business_level, capability_score, skills, tier,
                       team_size, capital, revenue, clients
                FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1
            ''', (user_id,))
        a = cursor.fetchone()
        cursor.close()
        conn.close()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    if not a:
        return JsonResponse({"error": "No assessment found."}, status=404)

    prompt = f"""
You are an expert market analyst for the Indian market.
Generate real-time market intelligence data tailored to a {a['business_level']} agency in the '{a['domain']}' sector operating in {a['tier']} tier cities.

Respond ONLY with a valid JSON object strictly matching this schema, without any markdown formatting or extra text:
{{
  "trendData": [
    {{"month": "Aug", "core_service": <number 0-100>, "secondary_service": <number 0-100>, "emerging_service": <number 0-100>}},
    {{"month": "Sep", "core_service": <number 0-100>, "secondary_service": <number 0-100>, "emerging_service": <number 0-100>}},
    {{"month": "Oct", "core_service": <number 0-100>, "secondary_service": <number 0-100>, "emerging_service": <number 0-100>}},
    {{"month": "Nov", "core_service": <number 0-100>, "secondary_service": <number 0-100>, "emerging_service": <number 0-100>}},
    {{"month": "Dec", "core_service": <number 0-100>, "secondary_service": <number 0-100>, "emerging_service": <number 0-100>}},
    {{"month": "Jan", "core_service": <number 0-100>, "secondary_service": <number 0-100>, "emerging_service": <number 0-100>}}
  ],
  "pricingData": [
    {{"service": "<service name>", "beginner": <number>, "intermediate": <number>, "enterprise": <number>}},
    {{"service": "<service name>", "beginner": <number>, "intermediate": <number>, "enterprise": <number>}},
    {{"service": "<service name>", "beginner": <number>, "intermediate": <number>, "enterprise": <number>}},
    {{"service": "<service name>", "beginner": <number>, "intermediate": <number>, "enterprise": <number>}}
  ],
  "heatmapData": [
    {{"city": "<Indian City Name>", "demand": <number 0-100>, "competition": "High|Medium|Low", "opportunity": "High|Medium|Very High"}},
    {{"city": "<Indian City Name>", "demand": <number 0-100>, "competition": "High|Medium|Low", "opportunity": "High|Medium|Very High"}},
    {{"city": "<Indian City Name>", "demand": <number 0-100>, "competition": "High|Medium|Low", "opportunity": "High|Medium|Very High"}},
    {{"city": "<Indian City Name>", "demand": <number 0-100>, "competition": "High|Medium|Low", "opportunity": "High|Medium|Very High"}},
    {{"city": "<Indian City Name>", "demand": <number 0-100>, "competition": "High|Medium|Low", "opportunity": "High|Medium|Very High"}},
    {{"city": "<Indian City Name>", "demand": <number 0-100>, "competition": "High|Medium|Low", "opportunity": "High|Medium|Very High"}}
  ]
}}
"""
    try:
        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024
        )
        raw = chat.choices[0].message.content.strip()
        data = parse_groq_json(raw)
    except Exception as e:
        logger.error(traceback.format_exc())
        return JsonResponse({"error": "Groq error.", "detail": str(e)}, status=502)

    return JsonResponse(data)
