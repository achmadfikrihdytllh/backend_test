PDF Management System API (AdonisJS v6)1. Deskripsi ProjectProject ini adalah sistem RESTful API untuk manajemen dokumen PDF yang dibangun menggunakan framework AdonisJS v6. API ini mendukung alur kerja pembuatan laporan otomatis (rendering HTML ke PDF), pengunggahan file fisik, serta manajemen status data menggunakan metode soft-delete.

Tech StackFramework: AdonisJS v6 (TypeScript).Runtime: Node.js (v20.6.0+).Database: PostgreSQL.ORM: Lucid ORM.PDF Engine: Puppeteer.Validator: VineJS.3. Struktur Folder ProjectPlaintextbackend-test/
├── app/
│   ├── controllers/      # Logika utama (PdfReportsController)
│   ├── models/           # Definisi skema tabel (PdfFile)
│   └── validators/       # Skema validasi input (VineJS)
├── database/
│   └── migrations/       # File struktur tabel database
├── start/
│   ├── env.ts            # Validasi variabel environment
│   └── routes.ts         # Definisi endpoint API
├── uploads/pdf/          # Folder penyimpanan file fisik PDF
└── .env                  # Konfigurasi environment (Rahasia)

Cara Instalasi dan Menjalankan Project
Langkah 1: Clone RepositoryBashgit clone <url-repository-kamu>
cd backend_test
Langkah 2: Install DependenciesBashnpm install
Langkah 3: Konfigurasi DatabaseBuka TablePlus atau tool database lainnya.Buat database baru bernama backend_test di PostgreSQL.Pastikan PostgreSQL berjalan di port 5432.Langkah 4: Konfigurasi EnvironmentBuat file .env dan sesuaikan dengan konfigurasi berikut:Cuplikan kodePORT=3333
HOST=localhost
NODE_ENV=development
APP_KEY=X9OuI9F2lqz8R81eEESzlxLvz6b5ctrk

DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_DATABASE=backend_test

Jalankan Migrasi dan ServerBash# Membuat tabel database
node ace migration:run

# Menjalankan server development
npm run dev

erDiagram
    PDF_FILES {
        bigint id PK
        varchar filename
        varchar original_name
        varchar filepath
        bigint size
        enum status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
