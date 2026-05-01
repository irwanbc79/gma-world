"""
GMA Landing backend tests.
Covers: health, auth (login/me/logout), blog public + admin CRUD, contact public + admin CRUD,
MongoDB hygiene (no _id leaks, bcrypt format, unique indexes).
"""
import os
import uuid
import pytest
import requests
import pymongo

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://multi-lang-portal-4.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@gma.co.id"
ADMIN_PASSWORD = "gma-admin-2024"


# ════════════════════ Fixtures ════════════════════

@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_auth(session):
    """Login once; return (token, cookie_session)."""
    cookie_session = requests.Session()
    r = cookie_session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return {"token": data["access_token"], "cookies": cookie_session.cookies, "cookie_session": cookie_session, "user": data}


@pytest.fixture(scope="session")
def bearer_headers(admin_auth):
    return {"Authorization": f"Bearer {admin_auth['token']}", "Content-Type": "application/json"}


# ════════════════════ Health ════════════════════

class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"
        assert "service" in data


# ════════════════════ Auth ════════════════════

class TestAuth:
    def test_login_success_sets_cookie_and_returns_user(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 20
        assert "id" in data
        # httpOnly cookie set
        assert "access_token" in s.cookies
        # Verify HttpOnly flag in Set-Cookie header
        set_cookie = r.headers.get("set-cookie", "")
        assert "httponly" in set_cookie.lower(), f"HttpOnly flag missing: {set_cookie}"

    def test_login_wrong_password_401(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pwd"}, timeout=10)
        assert r.status_code == 401

    def test_login_unknown_email_401(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "nope@nope.com", "password": "x"}, timeout=10)
        assert r.status_code == 401

    def test_me_without_auth_401(self, session):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_me_with_bearer(self, bearer_headers):
        r = requests.get(f"{API}/auth/me", headers=bearer_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "password_hash" not in data
        assert "_id" not in data

    def test_me_with_cookie(self, admin_auth):
        cs = admin_auth["cookie_session"]
        r = cs.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_logout_clears_cookie(self):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        r = s.post(f"{API}/auth/logout", timeout=10)
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # cookie cleared (server sends expiring set-cookie)
        sc = r.headers.get("set-cookie", "").lower()
        assert "access_token" in sc


# ════════════════════ Blog public ════════════════════

class TestBlogPublic:
    def test_list_returns_seeded_posts(self, session):
        r = session.get(f"{API}/blog", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 6, f"expected >=6 seeded, got {len(items)}"
        # all published
        assert all(p.get("published") is True for p in items)
        # bilingual + required fields
        required = ["id", "slug", "title_id", "title_en", "excerpt_id", "excerpt_en",
                    "content_id", "content_en", "category_id", "category_en", "image", "published_at"]
        for p in items:
            for f in required:
                assert f in p, f"missing {f} in {p.get('slug')}"
            assert "_id" not in p
        # sorted desc by published_at
        pub = [p["published_at"] for p in items]
        assert pub == sorted(pub, reverse=True)

    def test_get_by_slug(self, session):
        r = session.get(f"{API}/blog/peluang-ekspor-komoditas-sumatera-belawan-2025", timeout=10)
        assert r.status_code == 200
        p = r.json()
        assert p["slug"] == "peluang-ekspor-komoditas-sumatera-belawan-2025"
        assert "Belawan" in p["title_en"]
        assert "_id" not in p

    def test_get_bad_slug_404(self, session):
        r = session.get(f"{API}/blog/does-not-exist-xyz", timeout=10)
        assert r.status_code == 404


# ════════════════════ Blog admin ════════════════════

class TestBlogAdmin:
    def test_admin_list_requires_auth(self, session):
        r = requests.get(f"{API}/admin/blog", timeout=10)
        assert r.status_code == 401

    def test_admin_list_with_auth(self, bearer_headers):
        r = requests.get(f"{API}/admin/blog", headers=bearer_headers, timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 6
        assert all("_id" not in p for p in items)

    def test_create_update_delete_and_slug_uniqueness(self, bearer_headers):
        unique_suffix = uuid.uuid4().hex[:6]
        payload = {
            "title_id": f"TEST Judul {unique_suffix}",
            "title_en": f"TEST Title {unique_suffix}",
            "excerpt_id": "TEST excerpt ID",
            "excerpt_en": "TEST excerpt EN",
            "content_id": "Konten TEST",
            "content_en": "TEST content",
            "category_id": "Uji",
            "category_en": "Test",
            "image": "https://example.com/img.jpg",
        }
        r1 = requests.post(f"{API}/admin/blog", json=payload, headers=bearer_headers, timeout=10)
        assert r1.status_code == 200, r1.text
        p1 = r1.json()
        assert p1["title_en"] == payload["title_en"]
        assert p1["slug"].startswith(f"test-title-{unique_suffix}")
        post_id = p1["id"]
        assert "_id" not in p1

        # Verify persisted via GET public
        r_get = requests.get(f"{API}/blog/{p1['slug']}", timeout=10)
        assert r_get.status_code == 200

        # Duplicate title -> slug appended -2
        r2 = requests.post(f"{API}/admin/blog", json=payload, headers=bearer_headers, timeout=10)
        assert r2.status_code == 200
        p2 = r2.json()
        assert p2["slug"].endswith("-2"), f"expected -2 suffix, got {p2['slug']}"

        # Update — unchanged title_en should keep slug
        r3 = requests.put(f"{API}/admin/blog/{post_id}",
                          json={"excerpt_en": "UPDATED excerpt"}, headers=bearer_headers, timeout=10)
        assert r3.status_code == 200
        p3 = r3.json()
        assert p3["excerpt_en"] == "UPDATED excerpt"
        assert p3["slug"] == p1["slug"]  # slug unchanged

        # Update title_en -> slug regenerated
        new_title = f"TEST Renamed {unique_suffix}"
        r4 = requests.put(f"{API}/admin/blog/{post_id}",
                          json={"title_en": new_title}, headers=bearer_headers, timeout=10)
        assert r4.status_code == 200
        p4 = r4.json()
        assert p4["slug"] != p1["slug"]
        assert "renamed" in p4["slug"]

        # Delete both test posts
        rd1 = requests.delete(f"{API}/admin/blog/{post_id}", headers=bearer_headers, timeout=10)
        assert rd1.status_code == 200
        rd2 = requests.delete(f"{API}/admin/blog/{p2['id']}", headers=bearer_headers, timeout=10)
        assert rd2.status_code == 200

        # Verify gone
        rgone = requests.get(f"{API}/blog/{p4['slug']}", timeout=10)
        assert rgone.status_code == 404

    def test_delete_nonexistent_returns_404(self, bearer_headers):
        r = requests.delete(f"{API}/admin/blog/nonexistent-{uuid.uuid4().hex}", headers=bearer_headers, timeout=10)
        assert r.status_code == 404


# ════════════════════ Contact ════════════════════

class TestContact:
    _created_id = None

    def test_public_submit_valid(self, session):
        payload = {
            "name": "TEST Jane Doe",
            "email": "test.jane@example.com",
            "phone": "+62-812-3456",
            "company": "TEST Co",
            "subject": "Inquiry",
            "message": "Hello from pytest",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert isinstance(data["id"], str)
        TestContact._created_id = data["id"]

    def test_public_submit_invalid_email_422(self, session):
        r = session.post(f"{API}/contact", json={
            "name": "x", "email": "not-email", "subject": "s", "message": "m"
        }, timeout=10)
        assert r.status_code == 422

    def test_admin_list_requires_auth(self):
        r = requests.get(f"{API}/admin/contacts", timeout=10)
        assert r.status_code == 401

    def test_admin_list_and_mark_read_and_delete(self, bearer_headers):
        r = requests.get(f"{API}/admin/contacts", headers=bearer_headers, timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert all("_id" not in s for s in items)
        # sorted desc by created_at
        created = [s["created_at"] for s in items]
        assert created == sorted(created, reverse=True)
        # our created id should be first
        cid = TestContact._created_id
        assert cid is not None
        assert any(s["id"] == cid for s in items)

        # Mark as read
        r2 = requests.patch(f"{API}/admin/contacts/{cid}/read", headers=bearer_headers, timeout=10)
        assert r2.status_code == 200
        # Verify read flag
        r3 = requests.get(f"{API}/admin/contacts", headers=bearer_headers, timeout=10)
        target = next(s for s in r3.json() if s["id"] == cid)
        assert target["read"] is True

        # Delete
        r4 = requests.delete(f"{API}/admin/contacts/{cid}", headers=bearer_headers, timeout=10)
        assert r4.status_code == 200
        # Deleting again -> 404
        r5 = requests.delete(f"{API}/admin/contacts/{cid}", headers=bearer_headers, timeout=10)
        assert r5.status_code == 404


# ════════════════════ MongoDB hygiene ════════════════════

class TestMongoHygiene:
    @pytest.fixture(scope="class")
    def mongo_db(self):
        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.environ.get("DB_NAME", "gma_landing")
        c = pymongo.MongoClient(mongo_url, serverSelectionTimeoutMS=3000)
        try:
            c.admin.command("ping")
        except Exception:
            pytest.skip("Mongo not reachable from tests")
        return c[db_name]

    def test_admin_password_is_bcrypt(self, mongo_db):
        user = mongo_db.users.find_one({"email": ADMIN_EMAIL})
        assert user is not None
        h = user["password_hash"]
        assert h.startswith("$2b$") or h.startswith("$2a$"), f"not bcrypt: {h[:10]}"

    def test_unique_indexes(self, mongo_db):
        u_idx = mongo_db.users.index_information()
        assert any(i.get("unique") and i.get("key") == [("email", 1)] for i in u_idx.values())
        b_idx = mongo_db.blog_posts.index_information()
        assert any(i.get("unique") and i.get("key") == [("slug", 1)] for i in b_idx.values())
