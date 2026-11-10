# Simple JSON REST API + Swagger UI (Siap Deploy ke Vercel)

Project REST API sederhana menggunakan **Node.js**, **Express**, dan sumber data dari file **JSON** (`data/items.json`), lengkap dengan dokumentasi interaktif **Swagger UI** yang sudah dikonfigurasi agar berjalan mulus di **Vercel Serverless Functions**.

## Struktur Project

```text
├── api/
│   └── index.js       # Entrypoint Express API & konfigurasi Swagger
├── data/
│   └── items.json     # Sumber data JSON
├── .gitignore
├── package.json
├── README.md
└── vercel.json        # Konfigurasi routing & bundling file JSON untuk Vercel
```

## Daftar Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/` | Info API & daftar link endpoint |
| `GET` | `/api-docs` | Dokumentasi interaktif **Swagger UI** |
| `GET` | `/api/items` | Ambil semua data item (mendukung query `?category=` & `?search=`) |
| `GET` | `/api/items/:id` | Ambil detail 1 item berdasarkan ID |
| `POST` | `/api/items` | Tambah item baru |
| `PUT` | `/api/items/:id` | Update item berdasarkan ID |
| `DELETE` | `/api/items/:id` | Hapus item berdasarkan ID |
| `POST` | `/api/reset` | Reset data kembali ke isi awal `data/items.json` |

---

## Cara Menjalankan di Lokal

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Jalankan server:**
   ```bash
   npm start
   ```

3. Buka di browser:
   - API Utama: `http://localhost:3000/api/items`
   - Swagger UI: `http://localhost:3000/api-docs`

---

## Cara Deploy ke Vercel

### Opsi 1: Menggunakan Vercel CLI (Paling Cepat)
1. Install Vercel CLI (jika belum ada):
   ```bash
   npm i -g vercel
   ```
2. Login dan deploy langsung dari folder ini:
   ```bash
   vercel
   ```
3. Untuk deploy ke production:
   ```bash
   vercel --prod
   ```

### Opsi 2: Menggunakan GitHub
1. Push folder ini ke repository GitHub baru.
2. Buka [vercel.com](https://vercel.com) -> **Add New** -> **Project**.
3. Import repository GitHub tersebut dan langsung klik **Deploy** (konfigurasi otomatis dibaca dari `vercel.json`).

