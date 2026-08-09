# 🛒 TokoKita E-Commerce App

![TokoKita Banner](https://via.placeholder.com/1200x400/4f46e5/ffffff?text=TokoKita+E-Commerce)

TokoKita adalah platform e-commerce *fullstack* modern yang dirancang untuk memberikan pengalaman berbelanja yang cepat, responsif, dan mudah digunakan. Proyek ini memisahkan arsitektur *frontend* dan *backend* (*Headless E-Commerce*) untuk performa dan skalabilitas yang maksimal.

## ✨ Fitur Utama

### 🛍️ Untuk Pelanggan (User)
- **Autentikasi & Profil**: Register, Login (dengan token JWT), dan manajemen profil akun.
- **Katalog Produk**: Daftar produk yang dinamis dengan gambar, harga, stok, dan kategori.
- **Keranjang Belanja (Cart)**: Menambah, mengurangi, atau menghapus produk dari keranjang secara *real-time*.
- **Checkout & Pesanan**: Sistem *checkout* pesanan yang aman dan riwayat transaksi pengguna.
- **Desain Responsif**: Tampilan UI/UX modern yang nyaman digunakan di HP, Tablet, maupun Desktop.

### 🔐 Untuk Admin (Dashboard)
- **Manajemen Kategori**: CRUD (Create, Read, Update, Delete) kategori produk.
- **Manajemen Produk**: Mengatur data produk, harga, stok, dan gambar.
- **Manajemen Pesanan**: Memantau dan mengubah status pesanan pelanggan.
- **Manajemen Pengguna**: Melihat daftar pelanggan yang terdaftar di sistem.
- **Statistik**: Grafik penjualan dan ringkasan data *(Chart.js)*.

---

## 💻 Teknologi yang Digunakan

### Frontend (User Interface)
- **Framework**: [Next.js](https://nextjs.org/) (React 18) - App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: Axios / Fetch API

### Backend (API & Database)
- **Framework**: [Laravel](https://laravel.com/) (PHP)
- **Database**: MySQL
- **Autentikasi**: Laravel Sanctum (Token-based API)
- **Storage**: Local/Symlink untuk manajemen file gambar

---

## 🚀 Instalasi & Menjalankan Lokal

Pastikan Anda sudah menginstal **Node.js**, **Composer**, dan **MySQL (XAMPP/MAMP)** di komputer Anda.

### 1. Setup Backend (Laravel)
```bash
cd backend
cp .env.example .env
# Sesuaikan konfigurasi database (DB_DATABASE, DB_USERNAME, dll) di file .env

composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

php artisan serve
```
*Backend akan berjalan di `http://localhost:8000`*

### 2. Setup Frontend (Next.js)
```bash
cd frontend
cp .env.local.example .env.local 
# Atau buat file .env.local dan isi: NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm install
npm run dev
```
*Frontend akan berjalan di `http://localhost:3000`*

---

## 🌍 Deployment (Produksi)

Proyek ini telah dikonfigurasi untuk kemudahan *deployment*:
- **Frontend** di-deploy secara otomatis menggunakan **Vercel** melalui integrasi GitHub.
- **Backend** di-deploy di shared hosting (DirectAdmin/cPanel) menggunakan sistem integrasi Webhook GitHub (`git push` otomatis ter-deploy ke server).

## 👨‍💻 Pengembang
Dikembangkan oleh **Achmad Darussalam Ridho**.
- LinkedIn: [https://www.linkedin.com/in/achmad-darussalam-ridho-65b0a3209/]
- Portofolio: [https://achmaddarussalamridho.my.id/]
