# PDF Management System - Technical Test

## 1. Deskripsi Project
Project ini adalah sistem manajemen dokumen PDF berbasis RESTful API yang dibangun menggunakan **AdonisJS v6**. Sistem ini memungkinkan pengguna untuk menghasilkan laporan PDF secara otomatis dari data JSON, mengunggah file PDF fisik, serta melakukan manajemen status data melalui fitur *soft delete*.

## 2. Tech Stack
* **Framework:** AdonisJS v6 (TypeScript).
* **Database:** PostgreSQL.
* **ORM:** Lucid ORM.
* **PDF Engine:** Puppeteer (HTML to PDF rendering).
* **Validator:** VineJS.

## 3. Cara Instalasi dan Menjalankan Project

### Langkah 1: Persiapan Database
1. Buat database baru bernama `backend_test` di PostgreSQL kamu.
2. Pastikan database berjalan di port `5432`.

### Langkah 2: Konfigurasi Environment
Buat file `.env` di root folder dan sesuaikan konfigurasinya:
```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=X9OuI9F2lqz8R81eEESzlxLvz6b5ctrk
NODE_ENV=development

# Bagian Database (PostgreSQL)
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_DATABASE=backend_test

# Bagian Drive/Uploads
DRIVE_DISK=local

# Install dependencies
npm install

# Jalankan migrasi untuk membuat tabel
node ace migration:run

# Jalankan server
npm run dev

backend-test/
├── app/
│   ├── controllers/      # Logika utama (PdfReportsController)
│   ├── models/           # Definisi skema data (PdfFile)
│   └── validators/       # Validasi input data (VineJS)
├── database/
│   └── migrations/       # File struktur tabel database
├── start/
│   ├── env.ts            # Validasi variabel environment
│   └── routes.ts         # Definisi semua endpoint API
└── uploads/pdf/          # Folder penyimpanan file fisik PDF

Method,Endpoint,Description
GET,/list,Mengambil semua file yang aktif (bukan DELETED).
POST,/generate,Generate laporan PDF dari template HTML.
POST,/upload,Upload file PDF fisik (Max 10MB).
DELETE,/:id,Mengubah status data menjadi DELETED (Soft Delete).

https://hrd-pis.postman.co/workspace/fikuriolnyv's~b79261eb-c260-451e-8297-dd426e6fe6c9/collection/50030575-575019a1-3016-4b9c-a736-c1699531d025?action=share&creator=50030575&active-environment=50030575-c41a5cd4-8e24-4028-a738-41adf2c5bfc9
