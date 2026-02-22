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
    return round(min(sum(SKILL_WEIGHTS.get(s, 5) for s in skills) / 10, 10), 2)


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

        cursor.execute("""
            SELECT domain, business_level, capability_score, confidence,
                   team_size, capital, revenue, clients
            FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1
        """, (user_id,))
        assessment = cursor.fetchone()

        cursor.close(); conn.close()

        return JsonResponse({
            "name":       user["name"] if user else "User",
            "assessment": assessment,
        })

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