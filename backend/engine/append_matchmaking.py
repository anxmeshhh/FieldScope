
# ─────────────────────────────────────────────
# SUCCESS LIBRARY
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def get_success_library(request):
    user_id = request.session.get("user_id")
    if not user_id: return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("SELECT id, domain, business_level, tier, ai_success_library FROM assessments WHERE user_id = %s AND id = %s", (user_id, hist_id))
        else:
            cursor.execute("SELECT id, domain, business_level, tier, ai_success_library FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (user_id,))
        a = cursor.fetchone()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    if not a: return JsonResponse({"error": "No assessment found."}, status=404)

    if a.get("ai_success_library"):
        cached = a["ai_success_library"]
        if isinstance(cached, str): cached = json.loads(cached)
        return JsonResponse({"library": cached, "cached": True})

    prompt = f"""
You are an expert business analyst compiling real-world-style case studies for Indian businesses.
Target Audience: {a['business_level']} '{a['domain']}' business in a {a['tier']} tier location.

Generate exactly 4 highly realistic and inspiring case studies/playbooks of similar businesses in India that overcame scaling challenges.
Respond ONLY with a valid JSON array, strictly adhering to this schema without extra text or markdown fences:
[
  {{
    "title": "Scaling [Area] for a [Domain] Firm",
    "company": "Fictional Name (e.g. Metro Web Solutions)",
    "challenge": "The main bottleneck they faced (2 sentences)",
    "strategy": "The exact steps they took (2 sentences)",
    "result": "Hard numbers (e.g., Scaled revenue by 40%, reduced churn by 15%)",
    "tags": ["Tag1", "Tag2"]
  }}
]
"""
    try:
        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile", messages=[{"role": "user", "content": prompt}], temperature=0.7, max_tokens=1024
        )
        library = parse_groq_json(chat.choices[0].message.content)
        cursor.execute("UPDATE assessments SET ai_success_library = %s WHERE id = %s", (json.dumps(library), a["id"]))
        conn.commit()
    except Exception as e:
        return JsonResponse({"error": "Groq error.", "detail": str(e)}, status=502)
    finally:
        cursor.close(); conn.close()

    return JsonResponse({"library": library, "cached": False})

# ─────────────────────────────────────────────
# VENDOR MATCHMAKING
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def get_vendor_matchmaking(request):
    user_id = request.session.get("user_id")
    if not user_id: return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("SELECT id, domain, business_level, tier, capital, ai_vendors FROM assessments WHERE user_id = %s AND id = %s", (user_id, hist_id))
        else:
            cursor.execute("SELECT id, domain, business_level, tier, capital, ai_vendors FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (user_id,))
        a = cursor.fetchone()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    if not a: return JsonResponse({"error": "No assessment found."}, status=404)

    if a.get("ai_vendors"):
        cached = a["ai_vendors"]
        if isinstance(cached, str): cached = json.loads(cached)
        return JsonResponse({"vendors": cached, "cached": True})

    prompt = f"""
You are a B2B vendor matchmaking AI. You act like a Google Maps for Business, curating hypothetical but highly realistic B2B vendors.
User Profile: {a['business_level']} '{a['domain']}' agency in a {a['tier']} tier city with ₹{a['capital']} monthly capital.

Generate exactly 5 optimal B2B vendors this business should partner with to scale (e.g., Legal consultants, specialized freelancers, software providers, raw material suppliers).
Respond ONLY with a valid JSON array, strictly adhering to this schema without extra text:
[
  {{
    "name": "Vendor Name",
    "type": "Vendor Type (e.g., Legal Counsel, Digital Marketing)",
    "distance": "Distance (e.g., 5km Away, Remote)",
    "rating": "Float between 4.0 and 5.0",
    "probability": "Percentage (e.g., 85%) representing Deal Closing Probability",
    "benefit": "Why partner with them? (1 sentence)",
    "action": "Next step to close the deal (1 sentence)"
  }}
]
"""
    try:
        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile", messages=[{"role": "user", "content": prompt}], temperature=0.7, max_tokens=1024
        )
        vendors = parse_groq_json(chat.choices[0].message.content)
        cursor.execute("UPDATE assessments SET ai_vendors = %s WHERE id = %s", (json.dumps(vendors), a["id"]))
        conn.commit()
    except Exception as e:
        return JsonResponse({"error": "Groq error.", "detail": str(e)}, status=502)
    finally:
        cursor.close(); conn.close()

    return JsonResponse({"vendors": vendors, "cached": False})

# ─────────────────────────────────────────────
# PEER MATCHMAKING
# ─────────────────────────────────────────────

@require_http_methods(["GET"])
def get_peer_matchmaking(request):
    user_id = request.session.get("user_id")
    if not user_id: return JsonResponse({"error": "Unauthorized."}, status=401)

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        hist_id = request.GET.get("id")
        if hist_id:
            cursor.execute("SELECT id, domain, business_level, tier, team_size, ai_peers FROM assessments WHERE user_id = %s AND id = %s", (user_id, hist_id))
        else:
            cursor.execute("SELECT id, domain, business_level, tier, team_size, ai_peers FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (user_id,))
        a = cursor.fetchone()
    except Exception as e:
        return JsonResponse({"error": "DB error.", "detail": str(e)}, status=500)

    if not a: return JsonResponse({"error": "No assessment found."}, status=404)

    if a.get("ai_peers"):
        cached = a["ai_peers"]
        if isinstance(cached, str): cached = json.loads(cached)
        return JsonResponse({"peers": cached, "cached": True})

    prompt = f"""
You are a peer networking AI for entrepreneurs.
User Profile: {a['business_level']} '{a['domain']}' agency in a {a['tier']} tier city with {a['team_size']} employees.

Generate exactly 4 synergistic peer businesses in the same city that the user should network and co-market with (e.g., a Web Agency pairing with a local PR Firm or an Ad Agency).
Respond ONLY with a valid JSON array, strictly adhering to this schema without extra text:
[
  {{
    "name": "Fictional Peer Company",
    "domain": "Their Business Domain",
    "synergy": "Percentage (e.g., 92%) representing Synergy Score",
    "reason": "Why connect? (1 sentence)",
    "strategy": "Exact co-marketing or referral strategy (1 sentence)"
  }}
]
"""
    try:
        chat = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile", messages=[{"role": "user", "content": prompt}], temperature=0.7, max_tokens=1024
        )
        peers = parse_groq_json(chat.choices[0].message.content)
        cursor.execute("UPDATE assessments SET ai_peers = %s WHERE id = %s", (json.dumps(peers), a["id"]))
        conn.commit()
    except Exception as e:
        return JsonResponse({"error": "Groq error.", "detail": str(e)}, status=502)
    finally:
        cursor.close(); conn.close()

    return JsonResponse({"peers": peers, "cached": False})
