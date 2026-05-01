from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from slugify import slugify


# ════════════════════════════════════════════════════
# Config & DB
# ════════════════════════════════════════════════════

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@gma.co.id').lower()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'gma-admin-2024')


# ════════════════════════════════════════════════════
# Helpers
# ════════════════════════════════════════════════════

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ════════════════════════════════════════════════════
# Models
# ════════════════════════════════════════════════════

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title_id: str
    title_en: str
    excerpt_id: str
    excerpt_en: str
    content_id: str
    content_en: str
    category_id: str
    category_en: str
    image: str
    author: str = "GMA Editorial"
    published: bool = True
    published_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BlogPostCreate(BaseModel):
    title_id: str
    title_en: str
    excerpt_id: str
    excerpt_en: str
    content_id: str
    content_en: str
    category_id: str
    category_en: str
    image: str
    author: Optional[str] = "GMA Editorial"
    published: bool = True


class BlogPostUpdate(BaseModel):
    title_id: Optional[str] = None
    title_en: Optional[str] = None
    excerpt_id: Optional[str] = None
    excerpt_en: Optional[str] = None
    content_id: Optional[str] = None
    content_en: Optional[str] = None
    category_id: Optional[str] = None
    category_en: Optional[str] = None
    image: Optional[str] = None
    author: Optional[str] = None
    published: Optional[bool] = None


class ContactSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    company: Optional[str] = ""
    subject: str
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    read: bool = False


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    company: Optional[str] = ""
    subject: str
    message: str


# ════════════════════════════════════════════════════
# App setup
# ════════════════════════════════════════════════════

app = FastAPI(title="GMA Landing API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"service": "GMA Landing API", "status": "ok"}


# ════════════════════════════════════════════════════
# Auth routes
# ════════════════════════════════════════════════════

@api_router.post("/auth/login")
async def login(body: LoginRequest, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user["id"], email)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 12,
        path="/",
    )
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": user.get("role", "admin"),
        "access_token": token,
    }


@api_router.get("/auth/me")
async def me(current=Depends(get_current_admin)):
    return current


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


# ════════════════════════════════════════════════════
# Blog — public
# ════════════════════════════════════════════════════

@api_router.get("/blog")
async def list_blog(limit: int = 100, only_published: bool = True):
    q = {"published": True} if only_published else {}
    items = await db.blog_posts.find(q, {"_id": 0}).sort("published_at", -1).to_list(limit)
    return items


@api_router.get("/blog/{slug}")
async def get_blog_by_slug(slug: str):
    item = await db.blog_posts.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Post not found")
    return item


# ════════════════════════════════════════════════════
# Blog — admin
# ════════════════════════════════════════════════════

@api_router.get("/admin/blog")
async def admin_list_blog(current=Depends(get_current_admin)):
    items = await db.blog_posts.find({}, {"_id": 0}).sort("published_at", -1).to_list(500)
    return items


@api_router.post("/admin/blog")
async def admin_create_blog(body: BlogPostCreate, current=Depends(get_current_admin)):
    base_slug = slugify(body.title_en) or slugify(body.title_id) or str(uuid.uuid4())[:8]
    slug = base_slug
    i = 1
    while await db.blog_posts.find_one({"slug": slug}):
        i += 1
        slug = f"{base_slug}-{i}"
    post = BlogPost(slug=slug, **body.model_dump())
    await db.blog_posts.insert_one(post.model_dump())
    return post.model_dump()


@api_router.put("/admin/blog/{post_id}")
async def admin_update_blog(post_id: str, body: BlogPostUpdate, current=Depends(get_current_admin)):
    existing = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if "title_en" in update:
        base_slug = slugify(update["title_en"]) or existing["slug"]
        if base_slug != existing["slug"]:
            slug = base_slug
            i = 1
            while await db.blog_posts.find_one({"slug": slug, "id": {"$ne": post_id}}):
                i += 1
                slug = f"{base_slug}-{i}"
            update["slug"] = slug
    if update:
        await db.blog_posts.update_one({"id": post_id}, {"$set": update})
    updated = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    return updated


@api_router.delete("/admin/blog/{post_id}")
async def admin_delete_blog(post_id: str, current=Depends(get_current_admin)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"ok": True}


# ════════════════════════════════════════════════════
# Contact
# ════════════════════════════════════════════════════

@api_router.post("/contact")
async def submit_contact(body: ContactCreate):
    sub = ContactSubmission(**body.model_dump())
    await db.contact_submissions.insert_one(sub.model_dump())
    return {"ok": True, "id": sub.id}


@api_router.get("/admin/contacts")
async def admin_list_contacts(current=Depends(get_current_admin)):
    items = await db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.delete("/admin/contacts/{sub_id}")
async def admin_delete_contact(sub_id: str, current=Depends(get_current_admin)):
    result = await db.contact_submissions.delete_one({"id": sub_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api_router.patch("/admin/contacts/{sub_id}/read")
async def admin_mark_read(sub_id: str, current=Depends(get_current_admin)):
    await db.contact_submissions.update_one({"id": sub_id}, {"$set": {"read": True}})
    return {"ok": True}


# ════════════════════════════════════════════════════
# Router & CORS
# ════════════════════════════════════════════════════

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ════════════════════════════════════════════════════
# Seeds
# ════════════════════════════════════════════════════

SEED_POSTS = [
    {
        "slug": "peluang-ekspor-komoditas-sumatera-belawan-2025",
        "title_id": "Peluang Ekspor Komoditas Sumatera Melalui Belawan di 2025",
        "title_en": "Sumatra Commodity Export Opportunities via Belawan in 2025",
        "excerpt_id": "Belawan tetap menjadi gerbang utama ekspor Sumatera Utara. Simak potensi komoditas yang siap memasuki pasar global tahun ini.",
        "excerpt_en": "Belawan remains the primary export gateway for North Sumatra. Explore commodities positioned to enter the global market this year.",
        "content_id": "Pelabuhan Belawan, sebagai salah satu pelabuhan tersibuk di Indonesia, memainkan peran vital dalam ekonomi Sumatera Utara. Di 2025, proyeksi volume ekspor komoditas seperti CPO, karet, dan hasil laut diperkirakan naik 12% dibanding tahun sebelumnya.\n\nSebagai mitra terintegrasi yang berlokasi strategis di Medan Timur, PT. Geya Mora Agung telah menyiapkan jaringan logistik dan pergudangan untuk mendukung eksportir lokal maupun internasional. Dukungan API-P aktif dan akses kepabeanan DJBC memungkinkan proses impor-ekspor berjalan lancar tanpa hambatan administratif.\n\nBeberapa komoditas unggulan Sumatera yang siap menembus pasar global tahun ini:\n\n1. Crude Palm Oil (CPO) — Permintaan dari India, China, dan Eropa tetap tinggi.\n2. Karet alam — Industri otomotif global memulai pemulihan.\n3. Kopi Mandailing & Lintong — Premium market di Jepang dan Amerika.\n4. Hasil laut segar & beku — Permintaan stabil dari Asia Tenggara.\n5. Produk turunan kelapa sawit — Bioenergi dan oleokimia.\n\nGMA siap menjadi mitra tepercaya untuk kebutuhan ekspor Anda.",
        "content_en": "Belawan Port, one of Indonesia's busiest ports, plays a vital role in North Sumatra's economy. In 2025, export volume projections for commodities such as CPO, rubber, and marine products are expected to rise 12% year-over-year.\n\nAs an integrated partner strategically located in East Medan, PT. Geya Mora Agung has prepared logistics and warehousing networks to support both local and international exporters. Active API-P licensing and DJBC customs access ensure import-export processes run smoothly without administrative hurdles.\n\nTop Sumatra commodities primed for the global market this year:\n\n1. Crude Palm Oil (CPO) — Demand from India, China, and Europe remains strong.\n2. Natural rubber — Global automotive industry recovery underway.\n3. Mandailing & Lintong coffee — Premium market in Japan and the US.\n4. Fresh & frozen marine products — Stable demand from Southeast Asia.\n5. Palm oil derivatives — Bioenergy and oleochemicals.\n\nGMA stands ready as your trusted export partner.",
        "category_id": "Logistik Maritim",
        "category_en": "Maritime Logistics",
        "image": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=80",
    },
    {
        "slug": "galangan-kapal-indonesia-era-digital",
        "title_id": "Galangan Kapal Indonesia: Tantangan & Peluang di Era Digital",
        "title_en": "Indonesia Shipyards: Challenges & Opportunities in the Digital Era",
        "excerpt_id": "Industri galangan kapal nasional tengah bertransformasi. Bagaimana GMA menyiapkan diri menghadapi era industri 4.0?",
        "excerpt_en": "The national shipyard industry is transforming. How is GMA preparing itself for the Industry 4.0 era?",
        "content_id": "Transformasi digital tidak lagi menjadi pilihan bagi industri galangan kapal Indonesia — melainkan kebutuhan mendesak. Tekanan efisiensi, standar keselamatan internasional, dan permintaan pasar yang fluktuatif memaksa pelaku industri berinovasi.\n\nDi GMA, investasi teknologi mencakup sistem manajemen proyek digital, penggunaan CAD 3D untuk desain kapal, dan integrasi sensor IoT pada fasilitas reparasi untuk monitoring real-time. Ini memungkinkan kami memberikan layanan shipbuilding & repair yang lebih cepat dan terukur.\n\nTiga peluang utama yang kami lihat:\n\n• Kapal penunjang perikanan & logistik regional — permintaan tinggi di Indonesia Timur.\n• Reparasi armada komersial — dengan usia armada rata-rata 15+ tahun, kebutuhan maintenance terus bertumbuh.\n• Kapal berbahan bakar alternatif (LNG/hybrid) — mengikuti tren dekarbonisasi maritim global.\n\nKBLI 30111 dan 33151 yang kami miliki menjadikan GMA siap secara legal dan operasional untuk mengambil peluang ini.",
        "content_en": "Digital transformation is no longer optional for Indonesia's shipyard industry — it is an urgent necessity. Efficiency pressure, international safety standards, and volatile market demand force industry players to innovate.\n\nAt GMA, technology investments include digital project management systems, 3D CAD for vessel design, and IoT sensor integration at repair facilities for real-time monitoring. This allows us to deliver faster and more measurable shipbuilding & repair services.\n\nThree key opportunities we see:\n\n• Fisheries support vessels & regional logistics — high demand in Eastern Indonesia.\n• Commercial fleet repair — with average fleet age over 15 years, maintenance needs keep growing.\n• Alternative-fuel vessels (LNG/hybrid) — following global maritime decarbonization trends.\n\nOur KBLI 30111 and 33151 licenses make GMA legally and operationally ready to seize these opportunities.",
        "category_id": "Industri Kapal",
        "category_en": "Shipbuilding",
        "image": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80",
    },
    {
        "slug": "panduan-api-p-2025-impor-bisnis",
        "title_id": "Panduan API-P 2025: Mulai Impor Barang untuk Bisnis Anda",
        "title_en": "API-P Guide 2025: Start Importing Goods for Your Business",
        "excerpt_id": "Memiliki API-P kini lebih mudah dengan sistem OSS. Pelajari syarat, prosedur, dan cara GMA membantu proses impor Anda.",
        "excerpt_en": "Obtaining API-P is now easier with the OSS system. Learn requirements, procedures, and how GMA supports your import process.",
        "content_id": "API-P (Angka Pengenal Importir Produsen) adalah dokumen penting bagi perusahaan yang ingin mengimpor barang untuk keperluan produksi atau bisnis sendiri. Sejak OSS RBA beroperasi penuh, proses penerbitan API-P terintegrasi dengan NIB.\n\nSyarat utama:\n\n1. NIB aktif dari sistem OSS.\n2. KBLI yang sesuai dengan kegiatan impor.\n3. NPWP perusahaan aktif.\n4. Bukti kepemilikan/sewa tempat usaha.\n5. Akta pendirian & perubahan (jika ada).\n\nProses umumnya memakan waktu 1–3 hari kerja setelah dokumen lengkap. Setelah API-P aktif, Anda dapat:\n\n• Mengakses sistem CEISA Bea Cukai untuk pemberitahuan impor.\n• Mendapatkan hak akses kepabeanan resmi DJBC.\n• Melakukan transaksi dengan pemasok internasional.\n\nGMA membantu mitra yang belum memiliki API-P dengan skema kemitraan impor — kami menjadi importir resmi dan Anda mendapatkan barang sesuai kebutuhan tanpa urus legalitas sendiri.",
        "content_en": "API-P (Producer Importer Identification Number) is an essential document for companies importing goods for their own production or business needs. Since OSS RBA is fully operational, API-P issuance is integrated with NIB.\n\nKey requirements:\n\n1. Active NIB from the OSS system.\n2. KBLI matching the import activity.\n3. Active corporate NPWP.\n4. Proof of business premises (owned/leased).\n5. Articles of incorporation & amendments (if any).\n\nThe process typically takes 1–3 working days after documents are complete. Once API-P is active, you can:\n\n• Access Bea Cukai's CEISA system for import declarations.\n• Obtain official DJBC customs access rights.\n• Transact with international suppliers.\n\nGMA supports partners without their own API-P via import partnership schemes — we act as the licensed importer while you receive goods as needed, without handling the legal process yourself.",
        "category_id": "Regulasi Kepabeanan",
        "category_en": "Customs Regulations",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    },
    {
        "slug": "pergudangan-medan-strategi-distribusi-sumatera",
        "title_id": "Pergudangan di Medan: Strategi Distribusi untuk Sumatera",
        "title_en": "Warehousing in Medan: Distribution Strategy for Sumatra",
        "excerpt_id": "Medan adalah hub distribusi paling efisien untuk wilayah Sumatera bagian utara. Kenali kunci sukses pergudangan modern.",
        "excerpt_en": "Medan is the most efficient distribution hub for northern Sumatra. Learn the keys to modern warehousing success.",
        "content_id": "Dengan posisi geografis di antara Pelabuhan Belawan dan Bandara Kualanamu, Medan menjadi titik ideal untuk konsolidasi dan distribusi barang ke seluruh Sumatera bagian utara, Aceh, serta jalur internasional Selat Malaka.\n\nKunci sukses operasional pergudangan modern mencakup:\n\n• Lokasi strategis dekat jalur utama & fasilitas intermodal.\n• Sistem inventori digital real-time.\n• Keamanan fisik & cyber bertingkat.\n• Fleksibilitas kapasitas musiman.\n\nFasilitas pergudangan GMA (KBLI 52101) dirancang mengikuti prinsip-prinsip tersebut — siap menampung komoditas agrikultur, barang impor, maupun produk jadi untuk distribusi regional.",
        "content_en": "With a geographic position between Belawan Port and Kualanamu Airport, Medan is the ideal point for consolidating and distributing goods across northern Sumatra, Aceh, and the Malacca Strait international corridor.\n\nKeys to modern warehousing operational success include:\n\n• Strategic location near main routes & intermodal facilities.\n• Real-time digital inventory systems.\n• Layered physical & cyber security.\n• Seasonal capacity flexibility.\n\nGMA's warehousing facility (KBLI 52101) is designed following these principles — ready to store agricultural commodities, imported goods, or finished products for regional distribution.",
        "category_id": "Pergudangan",
        "category_en": "Warehousing",
        "image": "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80",
    },
    {
        "slug": "konstruksi-gedung-medan-tren-2025",
        "title_id": "Konstruksi Gedung di Medan: Tren dan Proyeksi 2025",
        "title_en": "Building Construction in Medan: Trends and 2025 Outlook",
        "excerpt_id": "Permintaan gedung komersial dan hunian di Medan terus menguat. Simak tren desain dan konstruksi tahun ini.",
        "excerpt_en": "Demand for commercial and residential buildings in Medan keeps strengthening. Review this year's design and construction trends.",
        "content_id": "Sebagai kota metropolitan ketiga di Indonesia, Medan mengalami pertumbuhan konstruksi yang konsisten. Proyeksi 2025 menunjukkan kenaikan permintaan gedung perkantoran kelas A, apartemen menengah-atas, dan fasilitas mixed-use di koridor utama.\n\nTren utama yang mendominasi tahun ini:\n\n• Green building certification (EDGE, Greenship).\n• Konstruksi modular untuk percepatan jadwal.\n• Integrasi smart-building sejak tahap desain.\n• Material lokal berkelanjutan.\n\nGMA dengan KBLI 41011, 41012, dan 41019 siap menangani proyek konstruksi hunian, perkantoran, dan komersial berskala menengah hingga besar di Sumatera Utara.",
        "content_en": "As Indonesia's third metropolitan city, Medan experiences consistent construction growth. The 2025 outlook indicates rising demand for Class A office buildings, mid-to-high-end apartments, and mixed-use facilities along main corridors.\n\nKey trends dominating this year:\n\n• Green building certification (EDGE, Greenship).\n• Modular construction for schedule acceleration.\n• Smart-building integration from design stage.\n• Sustainable local materials.\n\nGMA — with KBLI 41011, 41012, and 41019 — is ready to handle mid-to-large-scale residential, office, and commercial construction projects across North Sumatra.",
        "category_id": "Konstruksi",
        "category_en": "Construction",
        "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
    },
    {
        "slug": "mengapa-integrated-trading-masa-depan-bisnis",
        "title_id": "Mengapa Integrated Trading Menjadi Masa Depan Bisnis",
        "title_en": "Why Integrated Trading is the Future of Business",
        "excerpt_id": "Konsep one-stop business group kian diminati. Bagaimana model ini memberikan efisiensi bagi mitra?",
        "excerpt_en": "The one-stop business group concept is increasingly popular. How does this model deliver efficiency for partners?",
        "content_id": "Efisiensi bisnis modern bukan hanya soal harga — melainkan juga kecepatan koordinasi. Model integrated trading memungkinkan satu entitas menangani rantai nilai mulai dari sourcing, logistik, pergudangan, hingga konstruksi fasilitas.\n\nKeuntungan bagi mitra:\n\n• Satu titik kontak — tidak perlu koordinasi banyak vendor.\n• Harga lebih kompetitif karena sinergi internal.\n• Timeline lebih pendek.\n• Transparansi biaya dan jadwal.\n\nGMA beroperasi di lima sektor utama sekaligus: perdagangan komoditas, industri kapal, pergudangan, konstruksi gedung, dan alat transportasi laut. Ini menjadikan kami partner ideal bagi korporasi dengan kebutuhan kompleks di Sumatera Utara.",
        "content_en": "Modern business efficiency is not only about price — it's also about coordination speed. The integrated trading model allows one entity to handle the value chain from sourcing, logistics, and warehousing to facility construction.\n\nAdvantages for partners:\n\n• Single point of contact — no need to coordinate multiple vendors.\n• More competitive pricing through internal synergy.\n• Shorter timelines.\n• Transparent costs and schedules.\n\nGMA operates simultaneously across five core sectors: commodity trading, shipbuilding, warehousing, building construction, and marine transport equipment. This makes us the ideal partner for corporations with complex needs in North Sumatra.",
        "category_id": "Strategi Bisnis",
        "category_en": "Business Strategy",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    },
]


@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.blog_posts.create_index("slug", unique=True)
    await db.blog_posts.create_index("id", unique=True)
    await db.contact_submissions.create_index("id", unique=True)

    # Seed admin (idempotent)
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "GMA Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user: %s", ADMIN_EMAIL)
    else:
        if not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.users.update_one(
                {"email": ADMIN_EMAIL},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info("Updated admin password: %s", ADMIN_EMAIL)

    # Seed blog posts if empty
    count = await db.blog_posts.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc)
        for i, data in enumerate(SEED_POSTS):
            post = {
                "id": str(uuid.uuid4()),
                "author": "GMA Editorial",
                "published": True,
                "published_at": (now - timedelta(days=i * 7)).isoformat(),
                **data,
            }
            await db.blog_posts.insert_one(post)
        logger.info("Seeded %d blog posts", len(SEED_POSTS))


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
