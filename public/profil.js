// ==================================================
// ⚠️ KONFIGURASI: DIHAPUS, PAKAI DARI auth.js SAJA ⚠️
// ==================================================
// ❌ BARIS INI DIHAPUS SEMUA:
// const SUPABASE_URL = "..."
// const SUPABASE_ANON_KEY = "..."
// const supabaseClient = ...

// ✅ GANTI: PAKAI KONEKSI YANG SUDAH ADA DI WINDOW
const supabaseClient = window.supabase;

// ==================================================
// 🚀 AMBIL ELEMEN
// ==================================================
const elemen = {
    jumlahPost: document.getElementById('jumlahPost'),
    jumlahFollower: document.getElementById('jumlahFollower'),
    jumlahLike: document.getElementById('jumlahLike'),
    kontenSaya: document.getElementById('kontenSaya'),
    kontenDisukai: document.getElementById('kontenDisukai'),
    kontenArsip: document.getElementById('kontenArsip'),
    loading: document.getElementById('loadingProfil'),
    kosong: document.getElementById('kosongProfil'),
    tabButtons: document.querySelectorAll('section button[data-target]')
};

// ==================================================
// ⚡ FUNGSI UTAMA
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    // Cek dulu koneksinya siap atau belum
    if (!supabaseClient) {
        elemen.loading.innerHTML = `<p class="text-red-500">⚠️ Sistem belum siap, muat ulang halaman</p>`;
        return;
    }
    aktifkanTab();
    ambilDataStatistik();
    ambilKontenSaya();
});

// ==================================================
// 📊 AMBIL DATA STATISTIK & PROFIL
// ==================================================
async function ambilDataStatistik() {
    const { count: jumlahKonten, error: errHitung } = await supabaseClient
        .from('contents')
        .select('*', { count: 'exact', head: true })
        .eq('aktif', true);

    if (!errHitung) elemen.jumlahPost.innerText = jumlahKonten || 0;

    elemen.jumlahFollower.innerText = '1.200';
    elemen.jumlahLike.innerText = '4.500';
}

// ==================================================
// 🎬 AMBIL DAFTAR KONTEN SAYA
// ==================================================
async function ambilKontenSaya() {
    try {
        const { data: konten, error } = await supabaseClient
            .from('contents')
            .select('id, judul, tipe, url_file, url_thumbnail, dibuat_pada')
            .eq('aktif', true)
            .order('dibuat_pada', { ascending: false });

        if (error) throw error;

        elemen.loading.classList.add('hidden');

        if (!konten || konten.length === 0) {
            elemen.kosong.classList.remove('hidden');
            return;
        }

        tampilkanGridKonten(konten);

    } catch (err) {
        elemen.loading.innerHTML = `<p class="text-red-500">Gagal memuat: ${err.message}</p>`;
    }
}

// ==================================================
// 🖼️ TAMPILKAN KONTEN BENTUK GRID + PREVIEW VIDEO
// ==================================================
function tampilkanGridKonten(listKonten) {
    listKonten.forEach(item => {
        const kartu = document.createElement('a');
        kartu.href = `detail.html?id=${item.id}`;
        kartu.className = 'aspect-ratio-9-16 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative group hover:scale-[0.98] transition-transform';

        // ✅ LOGIKA BARU: Kalau Video → Bikin Gambar Otomatis
        if (item.tipe === 'video') {
            // Kita masukkan elemen video tersembunyi buat ambil gambarnya
            kartu.innerHTML = `
                <video class="sembunyi" src="${item.url_file}" preload="metadata"></video>
                <canvas class="gambar-preview w-full h-full object-cover"></canvas>
                <!-- IKON PLAY BESAR DI TENGAH -->
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                        <i class="fa fa-play"></i>
                    </div>
                </div>
                <!-- JUDUL -->
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p class="text-white text-[10px] md:text-xs line-clamp-1">${item.judul}</p>
                </div>
            `;

            // Jalankan fungsi ambil gambar dari video
            ambilGambarDariVideo(kartu.querySelector('video'), kartu.querySelector('canvas'));
        }

        // ✅ Kalau Gambar/Stiker → Langsung tampilkan gambarnya
        else {
            kartu.innerHTML = `
                <img src="${item.url_file}" alt="${item.judul}" class="w-full h-full object-cover">
                <!-- IKON GAMBAR -->
                <div class="absolute top-2 right-2 text-white/90 text-lg drop-shadow-md">
                    <i class="fa fa-picture-o"></i>
                </div>
                <!-- JUDUL -->
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p class="text-white text-[10px] md:text-xs line-clamp-1">${item.judul}</p>
                </div>
            `;
        }

        elemen.kontenSaya.appendChild(kartu);
    });
}

// ==================================================
// 🛠️ FUNGSI: AMBIL GAMBAR DARI FILE VIDEO
// ==================================================
function ambilGambarDariVideo(elemenVideo, elemenCanvas) {
    elemenVideo.addEventListener('loadedmetadata', () => {
        // Pindah ke detik ke-1 biar ada gambarnya (gak hitam)
        elemenVideo.currentTime = 1;
    });

    elemenVideo.addEventListener('seeked', () => {
        // Gambar frame video ke kanvas
        const konteks = elemenCanvas.getContext('2d');
        elemenCanvas.width = elemenVideo.videoWidth;
        elemenCanvas.height = elemenVideo.videoHeight;
        konteks.drawImage(elemenVideo, 0, 0, elemenCanvas.width, elemenCanvas.height);

        // Hapus video tersembunyi karena sudah tidak butuh
        elemenVideo.remove();
    });

    // Kalau gagal muat video, kasih gambar pengganti
    elemenVideo.addEventListener('error', () => {
        elemenCanvas.parentElement.style.backgroundImage = `url('https://via.placeholder.com/300x500?text=Video+Tidak+Bisa+Dimuat')`;
        elemenCanvas.remove();
    });
}

// ==================================================
// 📱 FUNGSI PILIH TAB
// ==================================================
function aktifkanTab() {
    elemen.tabButtons.forEach(tombol => {
        tombol.addEventListener('click', () => {
            elemen.tabButtons.forEach(btn => btn.classList.remove('tab-aktif', 'border-utama', 'text-utama'));
            elemen.tabButtons.forEach(btn => btn.classList.add('text-gray-500', 'dark:text-gray-400'));
            document.querySelectorAll('section[id^="konten"]').forEach(el => el.classList.add('hidden'));

            tombol.classList.add('tab-aktif', 'border-utama', 'text-utama');
            tombol.classList.remove('text-gray-500', 'dark:text-gray-400');

            const idTarget = tombol.getAttribute('data-target');
            document.getElementById(idTarget).classList.remove('hidden');
        });
    });
}