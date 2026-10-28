// ============================================================
//  auth.js — inisialisasi Firebase & ekspor helper
//  Dipakai oleh: login.html, register.html, admin.html, dashboard.html
//  Tidak perlu diubah. Cukup isi firebase-config.js.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

// Inisialisasi
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Ekspor instance + fungsi yang dibutuhkan halaman lain
export {
  auth,
  db,
  // Auth
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  // Firestore
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
};

// Helper umum: ambil dokumen profil user dari koleksi "users"
export async function getProfil(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ============================================================
//  Riwayat login — koleksi "login_history"
//  Dicatat oleh: login.html (login / ditolak / menunggu),
//  dashboard.html (buka dashboard, sekali per sesi browser; keluar),
//  admin.html (keluar). Dibaca hanya oleh admin (lihat Security Rules).
// ============================================================
export function infoPerangkat() {
  const ua = navigator.userAgent || "";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /SamsungBrowser/.test(ua) ? "Samsung Internet"
    : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Lainnya";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Lainnya";
  const jenis = /Mobi|Android|iPhone|iPod/.test(ua) ? "Ponsel" : /iPad|Tablet/.test(ua) ? "Tablet" : "Komputer";
  return `${browser} · ${os} · ${jenis}`;
}

// aksi: "login" | "buka dashboard" | "logout" | "ditolak" | "menunggu"
// Tidak pernah menghalangi login: gagal mencatat hanya ditulis ke console,
// dan dibatasi waktu tunggu 2,5 detik.
export async function catatAktivitas(user, profil, aksi) {
  if (!user) return;
  const tulis = addDoc(collection(db, "login_history"), {
    uid: user.uid,
    email: user.email || "",
    nama: (profil && (profil.name || profil.nama)) || user.displayName || "",
    role: (profil && profil.role) || "user",
    aksi,
    perangkat: infoPerangkat(),
    halaman: (location.pathname.split("/").pop() || "index.html"),
    waktu: serverTimestamp()
  });
  try {
    await Promise.race([tulis, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2500))]);
  } catch (e) {
    console.warn("Riwayat login tidak tercatat:", e && e.message ? e.message : e);
  }
}
