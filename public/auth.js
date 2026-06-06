// ==================================================
// 🔐 AUTENTIKASI - VERSI BALIK KE HALAMAN ASAL LENGKAP
// ==================================================

// KONFIGURASI (JANGAN DIUBAH)
const SUPABASE_URL = "https://homxdefnvmclcebbkuwn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbXhkZWZudm1jbGNlYmJrdXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTUwMDYsImV4cCI6MjA5MzEzMTAwNn0.k10sOBsMB8GoIOFbOetdFoNCGM9SduL2p5MDvMOJMQk";

// 1. INISIALISASI SUPABASE
if (typeof supabase !== 'undefined') {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("Pustaka Supabase belum dipanggil di HTML!");
}

// ==================================================
// 🛡️ FUNGSI: KUNCI HALAMAN & SIMPAN TUJUAN
// ==================================================
async function wajibLogin() {
    if (!window.supabase) {
        setTimeout(wajibLogin, 50);
        return;
    }

    try {
        const { data: { user } } = await window.supabase.auth.getUser();

        if (!user) {
            // ✅ AMBIL NAMA HALAMAN YANG SEDANG DIBUKA
            const halamanAsal = window.location.pathname.split('/').pop(); // Ambil nama file saja (misal: profil.html)
            // Simpan di URL biar dibawa ke login
            window.location.replace(`login.html?pesan=harap_login&tujuan=${halamanAsal}`);
            return;
        }

        window.userAktif = user;

    } catch (err) {
        console.error("Kunci Halaman:", err);
        window.location.replace("login.html");
    }
}

// ==================================================
// ✅ FUNGSI: CEK BISA PAKAI FITUR
// ==================================================
async function cekBisaAksi() {
    if (!window.supabase) return false;
    try {
        const { data: { user } } = await window.supabase.auth.getUser();
        return !!user;
    } catch {
        return false;
    }
}

// ==================================================
// 🚀 LOGIKA HALAMAN LOGIN & DAFTAR
// ==================================================
function jalankanLogikaAuth() {
    // --- HALAMAN LOGIN ---
    if (document.getElementById('formLogin')) {
        const formLogin = document.getElementById('formLogin');
        const pesanLogin = document.getElementById('pesanLogin');

        // ✅ BACA: HALAMAN TUJUAN SETELAH LOGIN BERHASIL
        const urlParams = new URLSearchParams(window.location.search);
        const halamanTujuan = urlParams.get('tujuan') || 'index.html'; // Kalau kosong = ke Beranda

        // Kalau SUDAH login, langsung lompat ke tujuan
        window.supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) window.location.href = halamanTujuan;
        });

        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            tampilkanPesan(pesanLogin, "⌌ Sedang memproses...", "info");

            const email = document.getElementById('emailLogin').value;
            const pass = document.getElementById('passLogin').value;

            const { error } = await window.supabase.auth.signInWithPassword({ email, password: pass });

            if (error) return tampilkanPesan(pesanLogin, "❌ " + error.message, "salah");

            tampilkanPesan(pesanLogin, "✅ Berhasil masuk! Mengalihkan...", "benar");

            // ✅ PINDAH KE HALAMAN ASAL (upload/profil/index)
            setTimeout(() => window.location.href = halamanTujuan, 1200);
        });
    }

    // --- HALAMAN DAFTAR ---
    if (document.getElementById('formDaftar')) {
        const formDaftar = document.getElementById('formDaftar');
        const pesanDaftar = document.getElementById('pesanDaftar');

        const urlParams = new URLSearchParams(window.location.search);
        const halamanTujuan = urlParams.get('tujuan') || 'index.html';

        window.supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) window.location.href = halamanTujuan;
        });

        formDaftar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('emailDaftar').value;
            const pass = document.getElementById('passDaftar').value;
            const passUlang = document.getElementById('passUlang').value;

            if (pass !== passUlang) return tampilkanPesan(pesanDaftar, "❌ Kata sandi tidak sama!", "salah");
            if (pass.length < 6) return tampilkanPesan(pesanDaftar, "❌ Sandi minimal 6 karakter!", "salah");

            tampilkanPesan(pesanDaftar, "⌛ Membuat akun...", "info");

            const { error } = await window.supabase.auth.signUp({ email, password: pass });

            if (error) return tampilkanPesan(pesanDaftar, "❌ " + error.message, "salah");

            tampilkanPesan(pesanDaftar, "✅ Akun berhasil dibuat! Silakan masuk.", "benar");
            formDaftar.reset();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', jalankanLogikaAuth);
} else {
    jalankanLogikaAuth();
}

// ==================================================
// 🚪 FUNGSI: KELUAR
// ==================================================
async function keluarAkun() {
    if (window.supabase) await window.supabase.auth.signOut();
    window.location.href = "login.html";
}

// ==================================================
// 🔔 BANTUAN: TAMPIL PESAN
// ==================================================
function tampilkanPesan(elPesan, teks, jenis) {
    elPesan.classList.remove('hidden');
    elPesan.innerText = teks;
    elPesan.className = "mb-4 p-3 rounded-lg text-sm text-center " + (
        jenis === 'benar' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
            jenis === 'salah' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    );
}