// ==================================================
// ⚠️ KONFIGURASI (SUDAH SESUAI DATA KAMU) ⚠️
// ==================================================
const SUPABASE_URL = "https://homxdefnvmclcebbkuwn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbXhkZWZudm1jbGNlYmJrdXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTUwMDYsImV4cCI6MjA5MzEzMTAwNn0.k10sOBsMB8GoIOFbOetdFoNCGM9SduL2p5MDvMOJMQk";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================================================
// 🚀 VARIABEL GLOBAL
// ==================================================
const elemen = {
    daftarKonten: document.getElementById('daftarKonten'),
    loading: document.getElementById('loadingHalaman'),
    kosong: document.getElementById('kontenKosong')
};

let posisiAktif = 0;
let daftarDataKonten = [];
let videoSedangMain = null;

// ==================================================
// ⚡ MULAI: BACA ID DARI URL & AMBIL DATA
// ==================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Ambil ID konten yang diklik dari link: detail.html?id=XXX
    const urlParams = new URLSearchParams(window.location.search);
    const idDariUrl = urlParams.get('id');

    if (!idDariUrl) {
        tampilkanPesanKosong();
        return;
    }

    // Ambil SEMUA konten yang aktif, urutkan terbaru di atas
    await ambilSemuaKonten(idDariUrl);

    // Pasang pemantauan geser layar
    pasangEventScroll();
});

// ==================================================
// 📥 AMBIL DATA DARI SUPABASE
// ==================================================
async function ambilSemuaKonten(idAwal) {
    try {
        const { data, error } = await supabaseClient
            .from('contents')
            .select('*')
            .eq('aktif', true)
            .order('dibuat_pada', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) {
            tampilkanPesanKosong();
            return;
        }

        // Simpan data ke variabel global
        daftarDataKonten = data;

        // Cari posisi konten yang diklik user tadi
        posisiAktif = data.findIndex(item => item.id == idAwal);
        if (posisiAktif === -1) posisiAktif = 0;

        // Tampilkan semua konten ke layar
        tampilkanSemuaKonten();

        // Langsung geser ke konten yang diklik
        setTimeout(() => {
            elemen.daftarKonten.scrollTo({
                top: window.innerHeight * posisiAktif,
                behavior: 'instant'
            });
            elemen.loading.classList.add('hidden');
        }, 100);

    } catch (err) {
        elemen.loading.innerHTML = `<p class="text-red-400">Gagal muat: ${err.message}</p>`;
    }
}

// ==================================================
// 🎬 TAMPILKAN SATU PERSATU KONTEN
// ==================================================
function tampilkanSemuaKonten() {
    daftarDataKonten.forEach((konten, indeks) => {
        const kartu = document.createElement('div');
        kartu.className = 'konten-item h-screen w-full snap-start relative overflow-hidden';
        kartu.dataset.indeks = indeks;

        // ✅ ISI: VIDEO ATAU GAMBAR
        if (konten.tipe === 'video') {
            kartu.innerHTML = `
                <video 
                    class="w-full h-full object-cover" 
                    src="${konten.url_file}" 
                    preload="auto" 
                    loop 
                    muted 
                    playsinline
                ></video>
            `;
        } else {
            kartu.innerHTML = `
                <img 
                    class="w-full h-full object-contain bg-gelap/40" 
                    src="${konten.url_file}" 
                    alt="${konten.judul}"
                >
            `;
        }

        // ✅ OVERLAY INFORMASI (Kiri Bawah)
        const infoOverlay = document.createElement('div');
        infoOverlay.className = 'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent';
        infoOverlay.innerHTML = `
            <h3 class="font-bold text-lg mb-1">${konten.judul}</h3>
            <p class="text-sm text-gray-200 line-clamp-2 mb-2">${konten.deskripsi || 'Tidak ada deskripsi'}</p>
            <span class="text-xs text-gray-400">📅 ${new Date(konten.dibuat_pada).toLocaleDateString('id-ID')}</span>
        `;
        kartu.appendChild(infoOverlay);

        // ✅ TOMBOL AKSI (Kanan Tengah - Khas TikTok)
        const tombolAksi = document.createElement('div');
        tombolAksi.className = 'absolute right-3 bottom-20 flex flex-col items-center gap-6';
        tombolAksi.innerHTML = `
            <button class="group flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-black/20 backdrop-blur-xs flex items-center justify-center text-white text-lg group-hover:text-red-500 transition">
                    <i class="fa fa-heart-o"></i>
                </div>
                <span class="text-[10px] mt-1">${konten.jumlah_unduh || 0}</span>
            </button>
            <button class="group flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-black/20 backdrop-blur-xs flex items-center justify-center text-white text-lg group-hover:text-utama transition">
                    <i class="fa fa-comment-o"></i>
                </div>
                <span class="text-[10px] mt-1">24</span>
            </button>
            <button class="group flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-black/20 backdrop-blur-xs flex items-center justify-center text-white text-lg group-hover:text-green-400 transition">
                    <i class="fa fa-share-alt"></i>
                </div>
                <span class="text-[10px] mt-1">Bagikan</span>
            </button>
        `;
        kartu.appendChild(tombolAksi);

        // ✅ TAMBAH KE KONTAINER
        elemen.daftarKonten.appendChild(kartu);
    });
}

// ==================================================
// 📳 LOGIKA SCROLL: GANTI KONTEN & AUTOPLAY
// ==================================================
function pasangEventScroll() {
    let sedangGeser = false;

    elemen.daftarKonten.addEventListener('scroll', () => {
        if (sedangGeser) return;
        sedangGeser = true;

        // Tunggu sampai selesai geser
        clearTimeout(elemen.daftarKonten._timer);
        elemen.daftarKonten._timer = setTimeout(() => {
            const tinggiLayar = window.innerHeight;
            const posisiScroll = elemen.daftarKonten.scrollTop;
            const indeksBaru = Math.round(posisiScroll / tinggiLayar);

            // Kalau posisi berubah
            if (indeksBaru !== posisiAktif && daftarDataKonten[indeksBaru]) {
                posisiAktif = indeksBaru;
                aturPemutaranVideo();
            }

            sedangGeser = false;
        }, 150);
    });

    // Jalankan pertama kali pas halaman buka
    setTimeout(aturPemutaranVideo, 300);
}

// ==================================================
// 🎮 ATUR VIDEO: YANG TAMPAK MAIN, YANG LAIN BERHENTI
// ==================================================
function aturPemutaranVideo() {
    // Hentikan semua video
    document.querySelectorAll('.konten-item video').forEach(vid => {
        vid.pause();
        vid.currentTime = 0;
    });

    // Mainkan video yang sedang aktif
    const itemAktif = document.querySelector(`.konten-item[data-indeks="${posisiAktif}"]`);
    if (!itemAktif) return;

    const videoAktif = itemAktif.querySelector('video');
    if (videoAktif) {
        videoAktif.muted = false; // Bisa bunyi kalau mau, ubah ke true kalau mau diam
        videoAktif.play().catch(e => console.log("Autoplay diblokir browser:", e));
        videoSedangMain = videoAktif;
    }
}

// ==================================================
// ❌ PESAN JIKA KOSONG / SALAH LINK
// ==================================================
function tampilkanPesanKosong() {
    elemen.loading.classList.add('hidden');
    elemen.kosong.classList.remove('hidden');
}