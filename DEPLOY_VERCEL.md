# 🚀 Panduan Deploy EduSync ke Vercel & Neon PostgreSQL
> **100% Gratis Permanen & Tanpa Kartu Kredit (No Credit Card Required)**  
> Dibuat khusus untuk pemilik repository (`itsvin-debug/EduSync`).

---

## 📋 Ringkasan Alur (Hanya 4 Langkah)

1. **Buat Database** di [Neon.tech](https://neon.tech) (1 menit)
2. **Migrasi Database** dari komputer lokal ke Neon (1 perintah)
3. **Import Project** di [Vercel.com](https://vercel.com) (karena kamu pemilik repo, langsung muncul!)
4. **Isi Environment Variables** di Vercel lalu klik **Deploy**! 🎉

---

## ⚡ Langkah 1: Buat Database Gratis di Neon.tech

1. Buka [https://neon.tech](https://neon.tech) dan klik **Sign Up** (bisa login dengan akun GitHub).
2. Di dashboard Neon, klik **"Create Project"** atau **"New Project"**.
3. Isi form pembuatan:
   - **Project Name:** `edusync`
   - **Postgres version:** `16` atau `17` (default)
   - **Region:** `Asia Pacific (Singapore)` *(Penting: pilih Singapore agar loading super cepat dari Indonesia)*
4. Klik **Create Project**.
5. Setelah project jadi, kamu akan langsung melihat **Connection Details**:
   - Simpan informasi: **Host**, **Database**, **User**, dan **Password**.
   - Contoh connection string:
     `postgresql://neondb_owner:PASSWORD_KAMU@ep-xxx-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

---

## ⚡ Langkah 2: Jalankan Migrasi & Data Awal dari Komputer Lokal

Karena Vercel berjalan di lingkungan *serverless* (tidak ada terminal SSH permanen), struktur tabel dan data demo diisi satu kali dari komputer lokal ke server cloud Neon:

1. Buka file `.env` di folder project EduSync kamu di laptop.
2. Ubah bagian database sesuai data dari Neon tadi:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=ep-xxx-xxx.ap-southeast-1.aws.neon.tech
   DB_PORT=5432
   DB_DATABASE=neondb
   DB_USERNAME=neondb_owner
   DB_PASSWORD=password_dari_neon_kamu
   DB_SSLMODE=require

   SESSION_DRIVER=cookie
   CACHE_STORE=array
   QUEUE_CONNECTION=sync
   ```
3. Buka terminal di folder project, lalu jalankan perintah:
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```
   *Tunggu sampai selesai (semua tabel dan akun demo Admin, Guru, Siswa otomatis terisi ke cloud Neon).*

---

## ⚡ Langkah 3: Import Project di Vercel

1. Buka [https://vercel.com](https://vercel.com) dan login menggunakan akun **GitHub** kamu (`itsvin-debug`).
2. Di dashboard Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Cari repository **`EduSync`** di daftar repository kamu, lalu klik tombol **"Import"**.
4. Di bagian **Framework Preset**, biarkan **Other**.
5. Di bagian **Build and Output Settings**, biarkan default (semua sudah diatur otomatis oleh `vercel.json`).

---

## ⚡ Langkah 4: Masukkan Environment Variables di Vercel

Sebelum klik tombol Deploy, buka menu dropdown **"Environment Variables"** di halaman Vercel tersebut, lalu tambahkan variabel berikut:

| Key (Nama Variabel) | Value (Nilainya) |
|---|---|
| `APP_NAME` | `EDUSYNC` |
| `APP_KEY` | *(Salin nilai `APP_KEY` dari file `.env` lokal kamu)* |
| `APP_URL` | `https://localhost` *(atau kosongkan)* |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | *(Host Neon kamu, contoh: `ep-xxx.ap-southeast-1.aws.neon.tech`)* |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | `neondb` |
| `DB_USERNAME` | `neondb_owner` |
| `DB_PASSWORD` | *(Password database Neon kamu)* |
| `DB_SSLMODE` | `require` |

> 💡 **Catatan:** Variabel lain seperti `SESSION_DRIVER=cookie`, `CACHE_STORE=array`, routing index, dan cache path `/tmp` sudah **otomatis diatur di dalam file `vercel.json`**, jadi tidak perlu diisi manual lagi!

---

## 🚀 Selesai & Test Login!

Klik tombol biru **"Deploy"**!  
Vercel akan meng-compile frontend React + Inertia dan menghubungkannya ke backend PHP. Dalam 1–2 menit, web kamu sudah tayang di internet dengan URL gratis seperti:
👉 `https://edusync-xxx.vercel.app`

### 🔑 Akun Bawaan untuk Uji Coba:
* **Admin Kurikulum:**
  * Email: `admin@edusync.sch.id`
  * Password: `password`
* **Guru Pengampu:**
  * Email: `guru@edusync.sch.id`
  * Password: `password`
* **Ketua Kelas (Siswa):**
  * Email: `siswa@edusync.sch.id`
  * Password: `password`

---

## ❓ FAQ & Catatan Teknis Vercel
* **Apakah cold start aman?** Vercel Serverless memiliki cold start singkat (1–2 detik pada request pertama setelah tidak aktif), setelah itu respons normal dan cepat.
* **Unggahan Foto/File:** Karena filesystem Vercel berstatus read-only (hanya `/tmp` yang dapat ditulisi sementara), untuk penyimpanan foto profil/bukti piket jangka panjang dianjurkan menghubungkan external storage seperti Cloudinary atau AWS S3.
