# Panduan Setup — Sistem Login Bappebti Performance Intelligence

Dokumen ini memandu Anda memasang sistem login (Firebase) untuk dashboard, dari nol sampai online di GitHub Pages. Ikuti **Tahap A → B → C** secara berurutan.

---

## 1. Daftar Berkas

| Berkas | Fungsi | Perlu diedit? |
|---|---|---|
| `index.html` | **Pengalih** otomatis ke `login.html` (pintu masuk situs) | Tidak |
| `login.html` | Halaman **Masuk** | Tidak |
| `register.html` | Halaman **Daftar** (akun baru berstatus *pending*) | Tidak |
| `admin.html` | **Panel Admin**: menyetujui/menolak akun & mengatur peran | Tidak |
| `dashboard.html` | **Dashboard lengkap + gerbang login** (halaman yang dilindungi) | Tidak |
| `auth.js` | Inisialisasi Firebase + fungsi bantu | Tidak |
| `firebase-config.js` | **Konfigurasi Firebase** | **YA — wajib diisi** |
| `styles.css` | Tema halaman login/daftar/admin | Tidak |
| `PANDUAN-SETUP.md` | Dokumen ini | — |

> Catatan penting: **dashboard yang asli kini berada di `dashboard.html`** (sudah dilengkapi gerbang login). `index.html` hanya pengalih ke halaman masuk, supaya situs tidak bisa dibuka tanpa login.

---

## 2. Cara Kerja Singkat (Alur)

```
Pengunjung buka situs
        │
   index.html  ──►  login.html
                        │
              ┌─────────┴───────────┐
        belum punya akun        sudah punya akun
              │                       │
        register.html            (Masuk)
        (status: pending)             │
              │                cek status akun di Firestore
        menunggu admin          ┌─────┴───────────────┐
              │            approved              pending / rejected
        admin.html  ──►   dashboard.html         tetap di login
        (Setujui)         (akses penuh)          (diberi pesan)
```

- Akun baru otomatis berstatus **pending** dan **belum bisa masuk**.
- **Administrator** menyetujui (approved) atau menolak (rejected) lewat `admin.html`.
- Hanya akun **approved** yang bisa membuka `dashboard.html`.

---

## TAHAP A — Menyiapkan Firebase

### A1. Buat Project Firebase
1. Buka **https://console.firebase.google.com** (login dengan akun Google).
2. Klik **Add project / Tambah project** → beri nama (mis. `bappebti-dashboard`) → ikuti hingga selesai. (Google Analytics boleh dimatikan.)

### A2. Daftarkan Web App & Salin Konfigurasi
1. Di halaman project, klik ikon **`</>`** (Web) untuk **Add app**.
2. Beri nama app (mis. `dashboard-web`) → **Register app**.
3. Firebase menampilkan objek **`firebaseConfig`**. Salin nilainya.
4. Buka berkas **`firebase-config.js`** dan ganti semua `GANTI_...` dengan nilai Anda:
   ```js
   export const firebaseConfig = {
     apiKey:            "AIza…",
     authDomain:        "namaproject.firebaseapp.com",
     projectId:         "namaproject",
     storageBucket:     "namaproject.appspot.com",
     messagingSenderId: "1234567890",
     appId:             "1:1234567890:web:abcdef…"
   };
   ```
   > Nilai ini **bukan rahasia** (wajar terlihat di browser). Keamanan diatur oleh **Security Rules** (langkah A5), bukan oleh menyembunyikan config.

### A3. Aktifkan Metode Login Email/Password
1. Menu kiri → **Build → Authentication** → **Get started**.
2. Tab **Sign-in method** → pilih **Email/Password** → **Enable** → **Save**.

### A4. Buat Database Firestore
1. Menu kiri → **Build → Firestore Database** → **Create database**.
2. Pilih lokasi (mis. `asia-southeast2 (Jakarta)`).
3. Pilih **Production mode** → **Enable**.
   > Koleksi **`users`** belum perlu dibuat manual — akan muncul otomatis setelah pendaftaran pertama.

### A5. Pasang Security Rules
1. Di **Firestore Database** → tab **Rules**.
2. **Ganti** seluruh isinya dengan berikut, lalu **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }
    function isAdmin() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'approved';
    }

    match /users/{userId} {
      // Baca: dokumen sendiri, atau admin boleh baca semua
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin());

      // Daftar: hanya boleh membuat dokumen MILIK SENDIRI,
      // dan dipaksa status 'pending' & role 'user' (mencegah swa-persetujuan)
      allow create: if isSignedIn()
        && request.auth.uid == userId
        && request.resource.data.status == 'pending'
        && request.resource.data.role == 'user';

      // Ubah status/peran & hapus: hanya admin
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## TAHAP B — Membuat Administrator Pertama

Karena pengubahan peran hanya boleh dilakukan admin, **admin pertama** harus ditetapkan **manual** lewat Firebase Console (aksi di console melewati Security Rules).

### B1. Jalankan situs lewat URL http/https
Buka `login.html`/`register.html` melalui alamat **http://** atau **https://** (mis. GitHub Pages di Tahap C, atau server lokal). **Jangan** lewat `file://…` karena modul & Firebase tidak berjalan dari berkas lokal langsung.

### B2. Daftarkan akun Anda
1. Buka **`register.html`** → isi Nama, Email, Kata Sandi → **Daftar**.
2. Akan muncul pesan "menunggu persetujuan". (Akun Anda kini ada di Firestore dengan status `pending`.)

### B3. Naikkan akun Anda menjadi admin (di Console)
1. Buka **Firestore Database** → koleksi **`users`** → klik dokumen milik Anda (ID = UID).
2. Ubah dua field:
   - `status` → **`approved`**
   - `role` → **`admin`**
3. Simpan.

### B4. Selesai — kelola dari panel admin
Sekarang buka **`admin.html`**, masuk dengan akun Anda. Anda dapat **Setujui/Tolak** akun lain dan **menjadikan pengguna sebagai admin**. Akun berikutnya cukup disetujui dari sini (tidak perlu lagi via Console).

---

## TAHAP C — Publikasi ke GitHub Pages

### C1. Unggah berkas ke repository
Unggah **semua** berkas berikut ke repo GitHub Anda (root repo):
`index.html`, `login.html`, `register.html`, `admin.html`, `dashboard.html`, `auth.js`, `firebase-config.js`, `styles.css`.

> ⚠️ **Penting:** unggah `index.html` (pengalih) versi ini — **jangan** mengunggah dashboard mentah tanpa gerbang sebagai `index.html`, karena akan bisa dibuka tanpa login.

### C2. Aktifkan Pages
**Settings → Pages →** Source: **Deploy from a branch** → Branch: **main** / `/root` → **Save**. Tunggu 1–2 menit.

### C3. Buka & uji
Buka URL situs Anda. Anda akan otomatis diarahkan ke **login**. Uji alur: Daftar → (setujui via admin) → Masuk → Dashboard.

### C4. Bila tampilan belum berubah
Lakukan **hard refresh**: **Ctrl + Shift + R** (Windows) / **Cmd + Shift + R** (Mac), atau buka di mode penyamaran (incognito). GitHub Pages & browser sering menyimpan versi lama.

---

## 3. Alur Status Akun

| Status | Arti | Bisa masuk dashboard? |
|---|---|---|
| `pending` | Baru daftar, menunggu admin | Tidak |
| `approved` | Disetujui admin | **Ya** |
| `rejected` | Ditolak admin | Tidak |

| Peran | Arti |
|---|---|
| `user` | Pengguna biasa |
| `admin` | Bisa membuka `admin.html` & mengelola akun |

---

## 4. Pemecahan Masalah (Troubleshooting)

| Gejala | Penyebab & Solusi |
|---|---|
| Pesan "Konfigurasi Firebase belum benar" | `firebase-config.js` masih berisi `GANTI_...` atau salah salin. Salin ulang dari Console (A2). |
| "Metode Email/Password belum diaktifkan" | Aktifkan di **Authentication → Sign-in method** (A3). |
| Koleksi `users` tidak ada di Firestore | Wajar — muncul **setelah** pendaftaran pertama, dan hanya jika diakses via **http/https** (bukan `file://`). |
| Halaman terus "Memeriksa akses…" | Biasanya Security Rules belum dipasang atau gangguan jaringan. Gerbang otomatis kembali ke `login.html`. Pastikan Rules (A5) sudah **Publish**. |
| Tidak bisa membuka `admin.html` ("Akses ditolak") | Pastikan dokumen Anda di Firestore: `role = admin` **dan** `status = approved` (B3). |
| Sudah daftar tapi tidak bisa masuk | Status masih `pending`. Minta admin menyetujui (atau setujui via Console). |
| Perubahan file tidak muncul di situs | Pastikan unggahan **menimpa** file lama, lalu **hard refresh** (C4). |
| Bisa daftar tapi gagal menyimpan profil | Security Rules `create` belum sesuai. Pastikan persis seperti A5 (status `pending`, role `user`). |

---

## 5. Catatan Keamanan (penting dipahami)

- Perlindungan ini bersifat **sisi-klien** (cocok untuk **data internal biasa**, bukan rahasia/terklasifikasi).
- Isi dashboard berada di dalam `dashboard.html`. Pengguna yang sangat teknis tetap dapat membaca sumber HTML-nya meski ada gerbang. Untuk data sensitif, gunakan hosting dengan **autentikasi sisi server** (mis. Firebase Hosting + Cloud Functions/akses terbatas, atau aplikasi backend).
- **Security Rules** (A5) adalah pelindung utama data di Firestore — jangan biarkan database dalam mode "test/terbuka".
- Pertimbangkan mengaktifkan **verifikasi email** dan kebijakan kata sandi yang lebih kuat di Firebase Authentication bila diperlukan.

---

*Bappebti · Sekretariat Direktorat Jenderal · Kementerian Perdagangan — © 2026*
