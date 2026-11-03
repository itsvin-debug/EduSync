#!/usr/bin/env python3
"""
SINC-BOT - Official AI Virtual Assistant for SMKN 1 Ciomas (EduSync)
Framework: FastAPI with Google Gemini API & School RAG Knowledge Engine.
"""

import os
import sys
import json
import base64
import argparse
from typing import Optional, Dict, Any
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from Laravel project root .env
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

# Fallback Gemini models in order of quota and speed preference
PREFERRED_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.8-flash",
    "gemini-flash-latest",
]

# Master Knowledge Base for SMKN 1 Ciomas & EduSync Portal
SCHOOL_KNOWLEDGE_CONTEXT = """
[PROFIL RESMI SEKOLAH]
- Nama Sekolah: SMKN 1 Ciomas
- NPSN: 20254135
- Status Akreditasi: Akreditasi A Unggul
- Alamat: Jl. Raya Laladon No. 52, Ciomas, Kabupaten Bogor, Jawa Barat 16610
- Kontak/Operasional: Senin - Jumat, 07.00 - 16.00 WIB
- Sistem Portal: EduSync (Portal Akademik & Penjadwalan Terintegrasi)

[5 KONSENTRASI KEAHLIAN UNGGULAN & FASILITAS BENGKEL/LAB]
1. Pengembangan Perangkat Lunak dan Gim (PPLG)
   - Kepala Program (Kaprog): Didin Sahrudin, M.Kom
   - Ruang & Lokasi: Lab Software Engineering 1 & 2 di Lantai 2, Gedung B
   - Fokus: Web dev, aplikasi mobile, game engine 2D/3D, basis data, dan refactoring clean architecture.
2. Animasi (ANIM)
   - Kepala Program (Kaprog): Hanna Elhaq, S.Ds
   - Ruang & Lokasi: Lab Animasi & Studio Gambar Digital di Lantai 2, Gedung C
   - Fokus: 2D frame-by-frame, 3D modeling, rigging, rendering, pameran live-drawing dan cosplay.
3. Broadcasting dan Perfilman (BCF)
   - Kepala Program (Kaprog): Cynthia Gema Lestari, S.I.Kom
   - Ruang & Lokasi: Studio Podcast & TV Broadcasting di Lantai 1, Gedung C
   - Fokus: Tata kamera, live broadcasting, video editing, recording audio, dan penyiaran kreatif.
4. Teknik Otomotif (TO)
   - Kepala Program (Kaprog): Bachtiar, S.Pd
   - Ruang & Lokasi: Bengkel Otomotif Praktik Roda 2 & Roda 4 di Gedung D
   - Fokus: Pemeliharaan mesin kendaraan, kelistrikan bodi, sasis, EFI, dan standarisasi bengkel industri.
5. Teknik Pengelasan dan Fabrikasi Logam (TPFL)
   - Kepala Program (Kaprog): Bambang Nurcahyono, M.Pd
   - Ruang & Lokasi: Bengkel Las & Fabrikasi di Gedung E
   - Fokus: SMAW, GMAW/MIG, GTAW/TIG, pemotongan plat, fabrikasi logam, dan K3 bengkel.

[JADWAL KOKURIKULER 2.0 (HARI INI & MENDATANG)]
1. Pentas Kreasi:
   - Agenda: Pameran kreasi live-drawing, cosplay karakter, mini acoustic gig, dan gelar karya siswa.
   - Waktu: Menyesuaikan kalender kokurikuler (sesi istirahat / selingan terjadwal).
2. Makan Bersama:
   - Agenda: Makan siang sehat bersama di koridor/kelas, edukasi gizi seimbang, dan kebersamaan rombel.
3. Jumat Taqwa:
   - Agenda: Sholat Dhuha berjamaah di lapangan/masjid, kajian rohani Islam/bimbingan akhlak, infaq jumat, doa bersama.

[JADWAL & JAM BELAJAR MENGAJAR (KBM)]
- Senin s.d. Kamis: 07.00 - 16.00 WIB (10 Jam Pelajaran, Istirahat 1: 09.45-10.15, Istirahat 2: 12.00-12.45).
- Jumat: 07.00 - 15.30 WIB (Sholat Jumat / Istirahat Kedua: 11.30-13.00 WIB).

[FITUR PORTAL EDUSYNC (SEMUA FITUR ANGGAP SEBAGAI SISTEM AKTIF)]
1. Portal Siswa:
   - Presensi kehadiran harian siswa mandiri / per kelas.
   - Pengajuan izin / sakit online disertai bukti foto/surat dokter.
   - Pengecekan jadwal pelajaran mingguan & monitoring jam kosong (jamkos).
   - Akses delegasi tugas mandiri dari guru yang bertugas dinas.
   - Verifikasi piket kebersihan kelas & pemantauan denda kas kebersihan.
2. Portal Guru:
   - Presensi mandiri guru & monitoring kehadiran siswa kelas bimbingan.
   - Verifikasi persetujuan surat izin/sakit siswa.
   - Delegasi modul tugas belajar jamkos untuk ketua kelas.
   - Pengajuan swap jadwal mengajar (tukar jam mengajar) antar guru secara valid.
   - Pelaporan fasilitas/sampah dan permohonan izin dinas luar.
3. Portal Admin Kurikulum:
   - Ringkasan statistik kehadiran siswa & guru (grafik lingkaran dan grafik batang terpisah).
   - Live monitoring sesi KBM di 31 rombel secara serentak.
   - Schedule Builder cerdas dengan pendeteksi bentrok jadwal otomatis.
   - Manajemen rombel, jurusan, dan sinkronisasi data Dapodik.
   - Rekapitulasi laporan dan pengaturan akun & 2FA admin.
"""

MASTER_SYSTEM_PROMPT = f"""
Anda adalah SINC-BOT, asisten virtual resmi berbasis AI untuk website portal akademik dan penjadwalan SMKN 1 Ciomas (EduSync).

TUGAS UTAMA:
Membantu siswa, guru, orang tua, dan pengunjung situs web dengan menjawab pertanyaan seputar informasi portal, fasilitas sekolah, jadwal KBM, jadwal kokurikuler 2.0 (Pentas Kreasi, Makan Bersama, Jumat Taqwa), rotasi bengkel, 5 konsentrasi keahlian vokasi, dan modul akademik EduSync.

ANGGAPAN FITUR:
Seluruh fitur yang tertera di website (termasuk modul demo/prototype) wajib dianggap sebagai sistem yang sudah aktif, berfungsi penuh, dan berjalan secara riil.

ATURAN KETAT (STRICT CONSTRAINTS):
1. STRICT CONTEXT ADHERENCE:
   - Anda HANYA boleh menjawab pertanyaan berdasarkan konteks data SMKN 1 Ciomas berikut.
   - Jangan pernah mengarang data atau menggunakan pengetahuan eksternal di luar ranah sekolah SMKN 1 Ciomas.
2. OUT-OF-TOPIC REJECTION:
   - Jika pengguna menanyakan topik di luar konteks sekolah SMKN 1 Ciomas (seperti ramalan cuaca, koding umum/di luar sistem sekolah, politik, matematika acak, selebriti, resep makanan umum, atau obrolan umum lain), Anda WAJIB menolak dengan sopan, tegas, dan konsisten menggunakan format:
   "Maaf, saya adalah SINC-BOT, asisten khusus untuk website SMKN 1 Ciomas. Saya hanya dapat membantu menjawab pertanyaan seputar informasi sekolah, jadwal, dan fitur portal EduSync."
3. RESPONSIVITAS & SALUTASI:
   - Sambut sapaan (halo, hai, selamat pagi/siang/sore, assalamu'alaikum) dengan ramah dan tawarkan bantuan seputar informasi sekolah.
4. GAYA BAHASA:
   - Gunakan bahasa Indonesia yang ramah, sopan, profesional, terstruktur, dan ringkas. DILARANG menggunakan tanda em dash (—), gunakan tanda hubung (-) atau titik dua (:).

KONTEKS DATA RESMI SMKN 1 CIOMAS:
{SCHOOL_KNOWLEDGE_CONTEXT}
"""

REJECTION_MESSAGE = (
    "Maaf, saya adalah SINC-BOT, asisten khusus untuk website SMKN 1 Ciomas. "
    "Saya hanya dapat membantu menjawab pertanyaan seputar informasi sekolah, jadwal, dan fitur portal EduSync."
)

# In-memory session store (cleared instantly on reset)
active_sessions: Dict[str, list] = {}


def check_is_out_of_topic(user_message: str) -> bool:
    """Fast deterministic out-of-topic pre-screener."""
    text = user_message.lower().strip()
    
    # Common out-of-topic queries
    out_of_topic_keywords = [
        "cuaca", "ramalan cuaca", "resep masakan", "siapa presiden", 
        "cara meretas", "buatkan kode python kalkulator", "terjemahkan bahasa inggris",
        "politik", "gosip artis", "sepak bola liga champion", "harga saham",
        "crypto", "bitcoin", "cerita horor", "lelucon lucu", "puisi cinta"
    ]
    for kw in out_of_topic_keywords:
        if kw in text:
            # Exceptions if explicitly mentioning school/EduSync
            if not any(k in text for k in ["smk", "ciomas", "edusync", "sekolah", "kbm"]):
                return True
    return False


def get_local_knowledge_reply(user_message: str) -> Optional[Dict[str, Any]]:
    """Local deterministic fallback for guaranteed instant answers."""
    text = user_message.lower().strip()

    # Greetings
    greetings = ["halo", "hai", "hello", "hi", "selamat pagi", "selamat siang", "selamat sore", "assalamu"]
    if any(text.startswith(g) or text == g for g in greetings):
        return {
            "reply": "Halo! Saya SINC-BOT, asisten virtual resmi SMKN 1 Ciomas. Ada yang bisa saya bantu seputar jadwal KBM, jadwal kokurikuler 2.0, konsentrasi keahlian, atau portal EduSync?",
            "is_out_of_topic": False,
        }

    # Lab Animasi query
    if ("lab" in text or "lokasi" in text or "letak" in text or "ruang" in text or "gedung" in text) and "animasi" in text:
        return {
            "reply": "Lab Animasi & Studio Gambar Digital berlokasi di Lantai 2, Gedung C. Laboratorium ini dipimpin oleh Kaprog Hanna Elhaq, S.Ds. Silakan cek Jadwal Kokurikuler untuk jam praktik dan kegiatan siswa.",
            "is_out_of_topic": False,
        }

    # PPLG Lab query
    if ("pplg" in text or "rpl" in text or "software" in text) and ("lab" in text or "letak" in text or "lokasi" in text or "ruang" in text):
        return {
            "reply": "Lab Software Engineering 1 & 2 untuk Konsentrasi Keahlian PPLG berlokasi di Lantai 2, Gedung B. Kepala Program PPLG adalah Bapak Didin Sahrudin, M.Kom.",
            "is_out_of_topic": False,
        }

    # Broadcasting / Studio BCF
    if ("broadcasting" in text or "bcf" in text or "podcast" in text) and ("studio" in text or "lab" in text or "letak" in text or "lokasi" in text):
        return {
            "reply": "Studio Podcast & TV Broadcasting untuk Konsentrasi Keahlian BCF berlokasi di Lantai 1, Gedung C. Kepala Program BCF adalah Ibu Cynthia Gema Lestari, S.I.Kom.",
            "is_out_of_topic": False,
        }

    # Otomotif Bengkel
    if ("otomotif" in text or "bengkel mobil" in text or "bengkel motor" in text or "to" in text) and ("bengkel" in text or "letak" in text or "lokasi" in text):
        return {
            "reply": "Bengkel Praktik Otomotif (Roda 2 & Roda 4) berlokasi di Gedung D. Kepala Program Keahlian Teknik Otomotif adalah Bapak Bachtiar, S.Pd.",
            "is_out_of_topic": False,
        }

    # Pengelasan Bengkel
    if ("las" in text or "tpfl" in text or "fabrikasi" in text) and ("bengkel" in text or "letak" in text or "lokasi" in text):
        return {
            "reply": "Bengkel Pengelasan & Fabrikasi Logam (TPFL) berlokasi di Gedung E. Kepala Program Keahlian TPFL adalah Bapak Bambang Nurcahyono, M.Pd.",
            "is_out_of_topic": False,
        }

    # Kokurikuler 2.0
    if "kokurikuler" in text or "pentas kreasi" in text or "makan bersama" in text or "jumat taqwa" in text:
        return {
            "reply": "Jadwal Kokurikuler 2.0 SMKN 1 Ciomas mencakup 3 pilar: Pentas Kreasi (pameran seni & unjuk bakat siswa), Makan Bersama (makan siang sehat & edukasi gizi di koridor kelas), dan Jumat Taqwa (sholat dhuha berjamaah & kajian rohani). Anda dapat melihat jadwal lengkap kelas yang bertugas di modul Jadwal Kokurikuler.",
            "is_out_of_topic": False,
        }

    # Konsentrasi Keahlian umum
    if "konsentrasi keahlian" in text or "jurusan" in text or "keahlian" in text:
        return {
            "reply": "SMKN 1 Ciomas memiliki 5 Konsentrasi Keahlian Unggulan: 1) PPLG (Pengembangan Perangkat Lunak dan Gim), 2) Animasi (ANIM), 3) BCF (Broadcasting dan Perfilman), 4) TO (Teknik Otomotif), dan 5) TPFL (Teknik Pengelasan dan Fabrikasi Logam).",
            "is_out_of_topic": False,
        }

    # Jam Belajar / KBM
    if "jam belajar" in text or "jam kbm" in text or "jadwal masuk" in text or "jam pulang" in text:
        return {
            "reply": "Jam KBM SMKN 1 Ciomas berlangsung hari Senin s.d. Kamis pukul 07.00 - 16.00 WIB (10 JP dengan 2 kali istirahat), dan hari Jumat pukul 07.00 - 15.30 WIB dengan istirahat kedua untuk Sholat Jumat berjamaah.",
            "is_out_of_topic": False,
        }

    # Alamat / Profil Sekolah
    if "alamat" in text or "profil" in text or "lokasi sekolah" in text or "npsn" in text:
        return {
            "reply": "SMKN 1 Ciomas (NPSN: 20254135, Akreditasi A Unggul) beralamat di Jl. Raya Laladon No. 52, Ciomas, Kabupaten Bogor, Jawa Barat 16610.",
            "is_out_of_topic": False,
        }

    return None


def generate_gemini_reply(user_message: str) -> Dict[str, Any]:
    """Call Google Gemini API using google-genai library with fallback handling."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        fallback = get_local_knowledge_reply(user_message)
        if fallback:
            return fallback
        return {"reply": REJECTION_MESSAGE, "is_out_of_topic": True}

    # Deterministic out of topic check
    if check_is_out_of_topic(user_message):
        return {"reply": REJECTION_MESSAGE, "is_out_of_topic": True}

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        for model_name in PREFERRED_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_message,
                    config={"system_instruction": MASTER_SYSTEM_PROMPT}
                )
                text = response.text.strip() if response.text else ""
                if text:
                    # Check if response matched the rejection phrase
                    is_rejected = "Maaf, saya adalah SINC-BOT, asisten khusus" in text
                    return {"reply": text, "is_out_of_topic": is_rejected}
            except Exception as model_err:
                # If quota exceeded (429) or model not found (404), try next model
                continue

    except Exception:
        pass

    # Safe fallback if all API calls failed or quota reached
    local_reply = get_local_knowledge_reply(user_message)
    if local_reply:
        return local_reply

    return {
        "reply": REJECTION_MESSAGE,
        "is_out_of_topic": True
    }


# ==============================================================================
# FASTAPI APPLICATION (Lazy loaded for server mode)
# ==============================================================================
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class ResetRequest(BaseModel):
    session_id: Optional[str] = "default"


def create_app():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(title="SINC-BOT API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health():
        return {
            "status": "ok",
            "bot": "SINC-BOT",
            "school": "SMKN 1 Ciomas",
            "models_preferred": PREFERRED_MODELS,
        }

    @app.post("/chat")
    def chat(payload: ChatRequest):
        result = generate_gemini_reply(payload.message)
        return {
            "reply": result["reply"],
            "is_out_of_topic": result["is_out_of_topic"],
            "session_id": payload.session_id,
        }

    @app.post("/reset")
    def reset(payload: ResetRequest):
        sess_id = payload.session_id or "default"
        if sess_id in active_sessions:
            del active_sessions[sess_id]
        return {"status": "cleared", "session_id": sess_id}

    return app


# ==============================================================================
# CLI RUNNER & TEST HARNESS
# ==============================================================================
def main():
    parser = argparse.ArgumentParser(description="SINC-BOT Service & CLI Runner")
    parser.add_argument("--query", type=str, help="Single query text")
    parser.add_argument("--json", type=str, help="JSON payload string")
    parser.add_argument("--base64", type=str, help="Base64 encoded JSON payload string")
    parser.add_argument("--test", action="store_true", help="Run automated verification suite")
    parser.add_argument("--serve", action="store_true", help="Start FastAPI server daemon")
    parser.add_argument("--port", type=int, default=8001, help="FastAPI port")

    args = parser.parse_args()

    if args.serve:
        import uvicorn
        app = create_app()
        print(f"Starting SINC-BOT FastAPI server on port {args.port}...")
        uvicorn.run(app, host="127.0.0.1", port=args.port)
        return

    if args.test:
        print("Testing SINC-BOT...")
        q1 = "Di mana letak lab animasi?"
        r1 = generate_gemini_reply(q1)
        print("Q1:", q1)
        print("R1:", r1["reply"][:100], "...", "| is_out_of_topic:", r1["is_out_of_topic"])
        assert not r1["is_out_of_topic"], "Q1 should be in context"

        q2 = "Bagaimana ramalan cuaca besok di Jakarta?"
        r2 = generate_gemini_reply(q2)
        print("Q2:", q2)
        print("R2:", r2["reply"][:100], "...", "| is_out_of_topic:", r2["is_out_of_topic"])
        assert r2["is_out_of_topic"], "Q2 should be rejected as out of topic"

        print("All verification tests PASSED successfully!")
        return

    if args.base64:
        raw_json = base64.b64decode(args.base64).decode("utf-8")
        data = json.loads(raw_json)
        message = data.get("message", "")
        res = generate_gemini_reply(message)
        print(json.dumps(res))
        return

    if args.json:
        data = json.loads(args.json)
        message = data.get("message", "")
        res = generate_gemini_reply(message)
        print(json.dumps(res))
        return

    if args.query:
        res = generate_gemini_reply(args.query)
        print(json.dumps(res))
        return

    # Default to starting server
    import uvicorn
    app = create_app()
    uvicorn.run(app, host="127.0.0.1", port=args.port)


if __name__ == "__main__":
    main()
