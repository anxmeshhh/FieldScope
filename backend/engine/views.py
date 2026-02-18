import json
import hashlib
import mysql.connector
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render


def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="theanimesh2005",
        database="fieldscope_db"
    )


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def landing_page(request):
    return render(request, "index.html")


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
        cursor.execute("SELECT id, name, email FROM users WHERE email = %s AND password_hash = %s",
                       (email, hash_password(password)))
        user = cursor.fetchone()

        cursor.execute("SELECT id FROM assessments WHERE user_id = %s LIMIT 1", (user["id"],)) if user else None
        has_assessment = bool(cursor.fetchone()) if user else False

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


@csrf_exempt
@require_http_methods(["POST"])
def submit_assessment(request):
    try:
        data = json.loads(request.body)
        user_id = request.session.get("user_id")

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO assessments (user_id, domain, capital, revenue, clients, team_size, skills, tier)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            data.get("domain", ""),
            data.get("capital", ""),
            data.get("revenue", ""),
            data.get("clients", ""),
            data.get("teamSize", ""),
            json.dumps(data.get("skills", [])),
            data.get("tier", ""),
        ))
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close(); conn.close()

        return JsonResponse({"id": new_id, "level": "Intermediate", "confidence": 87, "domain": data.get("domain", "")}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@require_http_methods(["GET"])
def landing_stats(request):
    return JsonResponse({"industries": 15, "business_levels": 3, "ai_features": 16, "revenue_potential": "₹50L+"})


@require_http_methods(["GET"])
def dashboard_data(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Not logged in"}, status=401)

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # Get user
        cursor.execute("SELECT name FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        # Get latest assessment
        cursor.execute("""
            SELECT domain, ai_level, confidence, team_size, capital, revenue, clients
            FROM assessments WHERE user_id = %s ORDER BY created_at DESC LIMIT 1
        """, (user_id,))
        assessment = cursor.fetchone()

        cursor.close()
        conn.close()

        return JsonResponse({
            "name": user["name"] if user else "User",
            "assessment": assessment,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)