// ============================================================
//  KONFIGURASI FIREBASE  —  ISI BAGIAN INI DENGAN MILIK ANDA
// ============================================================
//
// Cara mendapatkan nilai di bawah:
//   1. Buka  https://console.firebase.google.com  → buat / pilih project.
//   2. Klik ikon  </>  (Web)  untuk "Add app" → daftarkan app web.
//   3. Firebase akan menampilkan objek "firebaseConfig" — SALIN nilainya
//      ke bawah ini (ganti semua tulisan GANTI_... ).
//
//  PENTING: nilai-nilai ini BUKAN rahasia (boleh tampil di sisi browser).
//  Keamanan data diatur oleh "Security Rules" Firestore (lihat PANDUAN-SETUP.md),
//  bukan oleh penyembunyian config ini.
// ============================================================

export const firebaseConfig = {
  apiKey:            "GANTI_API_KEY",
  authDomain:        "GANTI_PROJECT_ID.firebaseapp.com",
  projectId:         "GANTI_PROJECT_ID",
  storageBucket:     "GANTI_PROJECT_ID.appspot.com",
  messagingSenderId: "GANTI_SENDER_ID",
  appId:             "GANTI_APP_ID"
};
