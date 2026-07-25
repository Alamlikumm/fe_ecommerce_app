# ARCHITECTURE.md

# Arsitektur Aplikasi E-Commerce

Aplikasi ini menggunakan arsitektur Headless (terpisah):

- **Backend:** Laravel 13 (API-only) berada di dalam direktori `/backend`.
- **Frontend:** Next.js (React) berada di dalam direktori `/frontend`.
- **Komunikasi Data:** Menggunakan protokol REST API dengan format JSON.