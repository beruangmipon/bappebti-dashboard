# Panduan Setup — Login + Daftar + Persetujuan Admin

Panduan ini ditujukan untuk Anda yang **tidak terbiasa dengan IT**. Ikuti
urutannya pelan-pelan. Bagian teknis hanya ada di **Tahap A** (sekali saja,
sekitar 15 menit). Setelah itu, tugas Anda cuma klik tombol.

Kalau ada langkah yang membingungkan, Anda bisa minta tolong rekan untuk
menemani Tahap A — setelahnya Anda bisa kelola sendiri.

---

## Gambaran besar (cara kerjanya)

1. Orang membuka **register.html** → mendaftar → akunnya berstatus *menunggu*.
2. Anda (admin) buka **admin.html** → klik **Setujui**.
3. Orang itu buka **login.html** → sekarang bisa masuk → diarahkan ke **dashboard.html**.
4. Yang belum login / belum disetujui **tidak bisa** membuka dashboard.

---

## TAHAP A — Setup sekali (di komputer)

### A1. Buat proyek Firebase (gratis)
1. Buka **https://console.firebase.google.com** lalu login dengan akun Google.
2. Klik **Add project / Tambah proyek**. Beri nama bebas, misal `dashboard-saya`.
3. Saat ditanya soal Google Analytics, boleh **dimatikan** (Disable). Klik **Create**.

### A2. Daftarkan aplikasi web & salin konfigurasi
1. Di halaman proyek, klik ikon **`</>`** (Web).
2. Beri nama panggilan, misal `web`. Klik **Register app**.
3. Akan muncul kode `const firebaseConfig = { ... }`. **Salin bagian dalam kurung kurawal itu.**
4. Buka file **firebase-config.js**, ganti tiap `GANTI_DENGAN_..._ANDA` dengan
   nilai dari Firebase Anda. Pastikan tanda kutip tetap ada. Simpan.

### A3. Aktifkan cara login Email
1. Menu kiri → **Build → Authentication** → tombol **Get started**.
2. Tab **Sign-in method** → pilih **Email/Password** → **Enable** → **Save**.

### A4. Buat database
1. Menu kiri → **Build → Firestore Database** → **Create database**.
2. Pilih lokasi terdekat (mis. `asia-southeast2` / Jakarta). Klik **Next**.
3. Pilih **Start in production mode** → **Enable**.

### A5. Pasang aturan keamanan
1. Masih di Firestore → tab **Rules**.
2. **Hapus semua** isinya, lalu **tempel** teks di bawah ini, klik **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null &&
                  (request.auth.uid == userId || isAdmin());
      allow create: if request.auth != null &&
                    request.auth.uid == userId &&
                    request.resource.data.status == 'pending' &&
                    request.resource.data.role == 'user';
      allow update: if isAdmin();
    }
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## TAHAP B — Jadikan diri Anda sebagai ADMIN (sekali saja)

1. Buka file **register.html** (lihat Tahap C cara membukanya) dan **daftar**
   memakai email Anda sendiri. Anggap ini akun admin Anda.
2. Kembali ke Firebase → **Firestore Database → tab Data**.
3. Buka koleksi **users**, klik dokumen milik Anda (cek emailnya).
4. Ubah dua kolom secara manual:
   - `status` → ganti dari `pending` menjadi **`approved`**
   - `role` → ganti dari `user` menjadi **`admin`**
   (Klik nilai → ubah → centang untuk simpan.)
5. Selesai. Mulai sekarang Anda bisa menyetujui orang lain lewat **admin.html**
   tanpa pernah menyentuh Firebase lagi.

---

## TAHAP C — Unggah ke GitHub

1. Letakkan **semua file** ini ke dalam repo GitHub Anda (folder yang sama
   dengan dashboard lama Anda):
   `firebase-config.js`, `auth.js`, `styles.css`,
   `login.html`, `register.html`, `admin.html`, `dashboard.html`.
2. **Pindahkan isi dashboard lama Anda** ke dalam `dashboard.html`,
   di bagian yang bertuliskan
   `TEMPEL ISI DASHBOARD ANDA YANG SUDAH ADA DI BAGIAN INI`.
3. Agar pengunjung langsung ke halaman login, cara termudah: ganti nama
   `login.html` menjadi **`index.html`** (dan ubah nama file lama yang
   bernama index.html jika ada).
4. Commit & push. GitHub Pages akan otomatis memperbarui situsnya.

---

## Pemakaian sehari-hari (tanpa IT)

- **Ada yang mau akses?** Minta dia buka halaman daftar dan mendaftar.
- **Menyetujui?** Buka **admin.html**, masuk pakai akun admin Anda,
  klik **Setujui** di nama orangnya. Selesai.
- **Mencabut akses?** Bisa ditambahkan nanti kalau perlu — tinggal bilang.

---

## Catatan jujur soal keamanan
Karena data Anda "internal biasa", cara ini sudah memadai. Yang perlu diingat:
isi di dalam `dashboard.html` tetap berupa file di GitHub, jadi orang yang
sangat paham teknis secara teori masih bisa mengintip file mentahnya. Untuk
data yang benar-benar rahasia, datanya sebaiknya disimpan di dalam database
(bukan di file) — itu pekerjaan terpisah yang bisa saya bantu bila nanti
dibutuhkan.
