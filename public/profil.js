// ==================================================
// ⚡️ LOGIKA PROFIL: CEPAT & RINGAN ✅
// ==================================================

// ✅ PAKAI KONEKSI YANG SUDAH ADA DARI auth.js
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
    if (!supabaseClient || !window.userId) {
        elemen.loading.innerHTML = `<p class="text-red-500">⚠️ Data pengguna tidak ditemukan</p>`;
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
    // ✅ HITUNG JUMLAH KONTEN MILIK USER INI SAJA
    const { count: jumlahKonten, error: errHitung } = await supabaseClient
        .from('contents')
        .select('*', { count: 'exact', head: true })
        .eq('aktif', true)
        .eq('user_id', window.userId); // <--- FILTER PENTING: HANYA MILIK SENDIRI

    if (!errHitung) elemen.jumlahPost.innerText = jumlahKonten || 0;

    elemen.jumlahFollower.innerText = '1.200';
    elemen.jumlahLike.innerText = '4.500';
}

// ==================================================
// 🎬 AMBIL DAFTAR KONTEN SAYA (USER LOGIN SAJA)
// ==================================================
async function ambilKontenSaya() {
    try {
        const { data: konten, error } = await supabaseClient
            .from('contents')
            .select('id, judul, tipe, url_file, url_thumbnail, dibuat_pada')
            .eq('aktif', true)
            .eq('user_id', window.userId) // <--- KUNCI FILTER
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
// 🖼️ TAMPILKAN KONTEN - VERSI CEPAT ✅
// ==================================================
function tampilkanGridKonten(listKonten) {
    listKonten.forEach(item => {
        const kartu = document.createElement('a');
        kartu.href = `detail.html?id=${item.id}`;
        kartu.className = 'aspect-ratio-9-16 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative group hover:scale-[0.98] transition-transform';

        // ✅ LOGIKA BARU: GAK MUAT VIDEO DI DAFTAR, PAKAI GAMBAR AJA
        let sumberGambar;

        // Kalau di kolom url_thumbnail ada isinya, pakai itu (paling cepat)
        if (item.url_thumbnail) {
            sumberGambar = item.url_thumbnail;
        }
        // Kalau Video: Pakai gambar pengganti ikon video biar gak berat
        else if (item.tipe === 'video') {
            sumberGambar = 'https://via.placeholder.com/300x500/1a1a1a/ffffff?text=Video';
        }
        // Kalau Gambar/Stiker: Langsung pakai filenya
        else {
            sumberGambar = item.url_file;
        }

        // ✅ TAMPILAN SAMA TAPI ISINYA GAMBAR, JADI KILAT
        kartu.innerHTML = `
            <img src="${sumberGambar}" alt="${item.judul}" class="w-full h-full object-cover">
            
            <!-- IKON KHUSUS VIDEO -->
            ${item.tipe === 'video' ? `
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                    <i class="fa fa-play"></i>
                </div>
            </div>` : ''}

            <!-- IKON GAMBAR -->
            ${(item.tipe === 'gambar' || item.tipe === 'stiker') ? `
            <div class="absolute top-2 right-2 text-white/90 text-lg drop-shadow-md">
                <i class="fa fa-picture-o"></i>
            </div>` : ''}

            <!-- JUDUL -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p class="text-white text-[10px] md:text-xs line-clamp-1">${item.judul}</p>
            </div>
        `;

        elemen.kontenSaya.appendChild(kartu);
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