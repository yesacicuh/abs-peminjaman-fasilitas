# Arsitektur dan Konsep Layanan

## 1. Diagram Komponen Arsitektur
Diagram ini menggambarkan batas layanan, protokol komunikasi, hak akses consumer-provider, serta pemisahan media penyimpanan.

```mermaid
graph TD
    %% Styling Komponen
    classDef clientStyle fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b;
    classDef serviceKatalog fill:#ede7f6,stroke:#512da8,stroke-width:2px,color:#311b92;
    classDef servicePeminjaman fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef dbStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100;

    %% Subgraph Klien (Consumer)
    subgraph KLIEN [" Consumer (Client Layer) "]
        CLI["Skrip Terminal Klien<br/>(Mahasiswa)"]:::clientStyle
        POSTMAN["Postman / HTTP Client<br/>(Admin & Pengujian)"]:::clientStyle
    end

    %% Subgraph Layanan Katalog (Port 3001)
    subgraph KATALOG_SVC [" Layanan Katalog & Auth (Port 3001) - Provider "]
        AUTH_MOD["Modul Auth<br/><code>POST /api/v1/auth/login</code>"]:::serviceKatalog
        FAC_MOD["Layanan Fasilitas<br/><code>GET /api/v1/facilities</code><br/><code>GET /api/v1/facilities/{id}</code>"]:::serviceKatalog
        DB_KATALOG[("Database Katalog<br/><code>katalog.db</code><br/>(tabel users, facilities)")]:::dbStyle
        
        AUTH_MOD --- DB_KATALOG
        FAC_MOD --- DB_KATALOG
    end

    %% Subgraph Layanan Peminjaman (Port 3002)
    subgraph LOAN_SVC [" Layanan Peminjaman (Port 3002) - Provider & Consumer "]
        LOAN_MOD["Layanan Peminjaman<br/><code>POST /api/v1/loans</code><br/><code>GET /api/v1/loans[/{id}]</code><br/><code>PATCH /api/v1/loans/{id}</code>"]:::servicePeminjaman
        DB_LOAN[("Database Peminjaman<br/><code>peminjaman.db</code><br/>(tabel loans)")]:::dbStyle
        
        LOAN_MOD --- DB_LOAN
    end

    %% Hubungan Komunikasi Klien ke Layanan
    CLI -->|"HTTP POST (JSON)<br/>Login kredensial"| AUTH_MOD
    CLI -->|"HTTP GET + Bearer JWT<br/>Lihat fasilitas"| FAC_MOD
    CLI -->|"HTTP POST/GET + Bearer JWT<br/>Ajukan & pantau pinjaman"| LOAN_MOD
    POSTMAN -->|"HTTP PATCH/GET + Bearer JWT (Admin)<br/>Proses pengajuan"| LOAN_MOD

    %% Komunikasi Antar-Layanan (Service-to-Service)
    LOAN_MOD ==>|"HTTP GET /api/v1/facilities/{id}<br/>Protokol: HTTP/REST (JSON)<br/>Forward: Bearer JWT<br/>(Cek keberadaan & status aktif)"| FAC_MOD

### Tabel Komponen, Peran, dan Penyimpanan
| Komponen | Peran | Protokol / Format | Tujuan | Database Terkait |
| :--- | :--- | :--- | :--- | :--- |
| **Skrip Terminal / Postman** | Consumer | HTTP / JSON | Autentikasi, melihat katalog, mengajukan peminjaman, memproses persetujuan | Tidak langsung (melalui API) |
| **Layanan Katalog & Auth (Port 3001)** | Provider | HTTP / JSON + Bearer JWT | Menerbitkan token JWT, menyajikan daftar dan detail fasilitas | `katalog.db` (users, facilities) |
| **Layanan Peminjaman (Port 3002)** | Provider & Consumer | HTTP / JSON + Bearer JWT | Mengelola transaksi peminjaman, memvalidasi ketersediaan jadwal | `peminjaman.db` (loans) |
| **Panggilan Antar-Layanan** | Peminjaman (Consumer) -> Katalog (Provider) | HTTP / JSON + Forward Bearer JWT | Memverifikasi ketersediaan dan status aktif fasilitas secara *real-time* | Tidak membaca database katalog secara langsung |

---

## 2. Empat Prinsip Inti Layanan
1. **Service Contract Terstandarisasi:** Kedua layanan menetapkan kontrak REST seragam menggunakan prefiks `/api/v1`, struktur JSON standar untuk data sukses dan pesan *error*, serta penggunaan status HTTP semantik (200, 201, 400, 401, 403, 404, 409).
2. **Loose Coupling (Keterikatan Longgar):** Layanan Peminjaman tidak bergantung pada database atau logika internal Katalog. Peminjaman hanya mengetahui endpoint publik `GET /api/v1/facilities/{id}` via variabel `KATALOG_BASE_URL`.
3. **Statelessness:** Server tidak menyimpan *session* login pengguna di memori. Setiap *request* yang dilindungi wajib menyertakan token JWT pada header `Authorization: Bearer <token>`, sehingga setiap transaksi dapat dieksekusi secara independen.
4. **Composability:** Layanan Peminjaman merangkai (*compose*) Layanan Katalog saat menerima pengajuan peminjaman baru untuk membentuk alur bisnis terpadu.

---

## 3. Pemanfaatan Ulang (Reuse) dan Klasifikasi Logic
* **Contoh Reuse Layanan Katalog:** Endpoint `GET /api/v1/facilities/{id}` dimanfaatkan langsung oleh skrip klien untuk melihat katalog, sekaligus dipakai oleh Layanan Peminjaman untuk memvalidasi fasilitas saat transaksi pengajuan. Di masa depan, layanan ini dapat dipakai oleh modul inventaris atau perawatan tanpa mengubah kode Layanan Katalog.
* **Logic Agnostic:** Pengambilan daftar dan detail fasilitas, validasi *signature* JWT, serta format struktur respons. Logika ini bersifat netral dan dapat digunakan di berbagai konteks sistem kampus.
* **Logic Non-Agnostic:** Pengecekan *overlap* jadwal fasilitas, batasan peminjaman berdasarkan peran mahasiswa, serta transisi status pengajuan (*pending* $\rightarrow$ *approved* / *rejected*). Logika ini spesifik hanya untuk proses bisnis peminjaman.