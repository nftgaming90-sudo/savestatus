// ==================================================
// ✅ 1. KONFIGURASI AWAL
// ==================================================
console.log("🔵 [LOG 1] Mulai memuat konfigurasi...");

const SUPABASE_URL = "https://homxdefnvmclcebbkuwn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbXhkZWZudm1jbGNlYmJrdXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTUwMDYsImV4cCI6MjA5MzEzMTAwNn0.k10sOBsMB8GoIOFbOetdFoNCGM9SduL2p5MDvMOJMQk";

let supabaseClient;

try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("🟢 [LOG 2] Koneksi Supabase BERHASIL dibuat!");
} catch (err) {
    console.error("🔴 [LOG 2 GAGAL] Error bikin koneksi:", err.message);
}

// ==================================================
// 📌 2. AMBIL ELEMEN HTML
// ==================================================
console.log("🔵 [LOG 3] Mencari elemen HTML...");
const daftarKontenEl = document.getElementById('daftarKonten');
const linkInput = document.getElementById('linkInput');
const btnCek = document.getElementById('btnCek');
const tombolKategori = document.querySelectorAll('.kategori-btn');

if (daftarKontenEl) console.log("🟢 [LOG 3] Elemen daftar konten DITEMUKAN");
else console.error("🔴 [LOG 3] Elemen daftar konten TIDAK ADA di HTML!");

// ==================================================
// 🚀 3. VARIABEL PENYIMPAN DATA GLOBAL
// ==================================================
let dataGlobal = [];

// ==================================================
// 🚀 4. MULAI PROGRAM
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🟢 [LOG 4] Halaman siap, mulai ambil data...");
    muatKontenDariSupabase();
    aktifkanTombolKategori();
    aktifkanFiturDownloadLink();
});

// ==================================================
// 📂 5. FUNGSI AMBIL DATA DARI DATABASE
// ==================================================
async function muatKontenDariSupabase() {
    try {
        console.log("🔵 [LOG 5] Mulai kirim permintaan ke database...");

        let { data, error } = await supabaseClient
            .from('contents')
            .select('id, judul, tipe, url_file, url_thumbnail, aktif')
            .eq('aktif', true);

        if (error) throw error;

        dataGlobal = data || [];
        tampilkanKontenBerdasarkanKategori('semua');

    } catch (err) {
        daftarKontenEl.innerHTML = `<p class="col-span-full text-center text-red-500 p-10">ERROR: ${err.message}</p>`;
    }
}

// ==================================================
// 🎛️ 6. LOGIKA UTAMA: FILTER & TAMPILKAN
// ==================================================
function tampilkanKontenBerdasarkanKategori(kategoriPilih) {
    daftarKontenEl.innerHTML = '';

    let dataFilter = [];
    if (kategoriPilih === 'semua') {
        dataFilter = [...dataGlobal];
    } else if (kategoriPilih === 'video') {
        dataFilter = dataGlobal.filter(item => item.tipe === 'video');
    } else if (kategoriPilih === 'gambar') {
        dataFilter = dataGlobal.filter(item => item.tipe === 'gambar');
    } else if (kategoriPilih === 'stiker') {
        dataFilter = dataGlobal.filter(item => item.tipe === 'stiker');
    }

    if (dataFilter.length === 0) {
        daftarKontenEl.innerHTML = '<p class="text-center text-yellow-500 col-span-full p-10">⚠️ Belum ada konten di kategori ini</p>';
        return;
    }

    const modeRapi = (kategoriPilih === 'gambar' || kategoriPilih === 'stiker');
    dataFilter.forEach(item => {
        const kartu = buatKartuKonten(item, modeRapi);
        daftarKontenEl.appendChild(kartu);
    });
}

// ==================================================
// 🃏 7. BIKIN TAMPILAN KARTU ✅ TOMBOL PLAY DOBEL UDAH BERES
// ==================================================
function buatKartuKonten(data, modeRapi = false) {
    const div = document.createElement('div');
    div.className = 'bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow mb-4';

    // === 🟢 MODE RAPI: GAMBAR / STIKER ===
    if (modeRapi) {
        div.className += ' max-w-md mx-auto';
        div.innerHTML = `
            <div class="w-full h-[280px] bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden konten-media">
                <img 
                    src="${data.url_thumbnail || data.url_file}" 
                    alt="${data.judul}" 
                    class="max-w-full max-h-full w-auto h-auto object-contain" 
                    onerror="this.src='https://placehold.co/600x400/ff0000/white?text=Gambar+Rusak'">
            </div>
            <div class="p-3">
                <h3 class="font-medium text-sm mb-2 line-clamp-1">${data.judul}</h3>
                <div class="flex gap-2">
                    <button class="btn-unduh flex-1 bg-utama text-white text-xs py-2 rounded-lg" data-url="${data.url_file}">Unduh</button>
                    <button class="btn-bagikan flex-1 bg-gray-200 dark:bg-gray-700 text-xs py-2 rounded-lg" data-url="${data.url_file}">Bagikan</button>
                </div>
            </div>
        `;
    }

    // === 🔵 MODE BEBAS: SEMUA / VIDEO / HASIL DOWNLOAD LINK ===
    else {
        if (data.tipe === 'video') {
            div.innerHTML = `
                <div class="w-full relative konten-media cursor-pointer">
                    <video 
                        class="w-full h-auto" 
                        preload="metadata"
                        playsinline
                        data-url="${data.url_file}">
                        <source src="${data.url_file}" type="video/mp4">
                    </video>
                    <div class="ikon-play-tengah absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 rounded-lg transition-opacity duration-300">
                        <div class="w-16 h-16 flex items-center justify-center rounded-full bg-black/50 text-white text-2xl backdrop-blur-sm">▶️</div>
                    </div>
                </div>
                <div class="p-3">
                    <h3 class="font-medium text-sm mb-2">${data.judul}</h3>
                    <div class="flex gap-2">
                        <button class="btn-unduh flex-1 bg-utama text-white text-xs-py-2 rounded-lg" data-url="${data.url_file}">Unduh</button>
                        <button class="btn-bagikan flex-1 bg-gray-200 dark:bg-gray-700 text-xs py-2 rounded-lg" data-url="${data.url_file}">Bagikan</button>
                    </div>
                </div>
            `;

            const videoEl = div.querySelector('video');
            const wadahVideoEl = div.querySelector('.konten-media');
            const ikonPlayEl = div.querySelector('.ikon-play-tengah');

            const updateIkon = () => {
                ikonPlayEl.classList.toggle('opacity-0', !(videoEl.paused || videoEl.ended));
            };

            wadahVideoEl.addEventListener('click', () => {
                videoEl.paused ? videoEl.play() : videoEl.pause();
                updateIkon();
            });

            videoEl.addEventListener('ended', updateIkon);
            videoEl.addEventListener('pause', updateIkon);
            videoEl.addEventListener('play', updateIkon);

        } else {
            div.innerHTML = `
                <div class="w-full flex justify-center bg-gray-50 dark:bg-gray-900/20 konten-media">
                    <img 
                        src="${data.url_thumbnail || data.url_file}" 
                        alt="${data.judul}" 
                        class="max-w-full max-h-[450px] w-auto h-auto object-contain" 
                        onerror="this.src='https://placehold.co/600x400/ff0000/white?text=Gambar+Rusak'">
                </div>
                <div class="p-3">
                    <h3 class="font-medium text-sm mb-2">${data.judul}</h3>
                    <div class="flex gap-2">
                        <button class="btn-unduh flex-1 bg-utama text-white text-xs py-2 rounded-lg" data-url="${data.url_file}">Unduh</button>
                        <button class="btn-bagikan flex-1 bg-gray-200 dark:bg-gray-700 text-xs py-2 rounded-lg" data-url="${data.url_file}">Bagikan</button>
                    </div>
                </div>
            `;
        }
    }
    return div;
}

// ==================================================
// 🔘 8. AKTIFKAN TOMBOL KATEGORI
// ==================================================
function aktifkanTombolKategori() {
    tombolKategori.forEach(btn => {
        btn.addEventListener('click', () => {
            tombolKategori.forEach(b => b.classList.remove('bg-utama', 'text-white'));
            tombolKategori.forEach(b => b.classList.add('bg-white', 'dark:bg-gray-800'));
            btn.classList.remove('bg-white', 'dark:bg-gray-800');
            btn.classList.add('bg-utama', 'text-white');
            const jenis = btn.getAttribute('data-kategori');
            tampilkanKontenBerdasarkanKategori(jenis);
        });
    });
}

// ==================================================
// 🆕 9. FITUR UTAMA: DOWNLOAD DARI LINK IG / TIKTOK ✅ VERSI SERVER
// ==================================================
function aktifkanFiturDownloadLink() {
    if (!btnCek || !linkInput) return;

    btnCek.addEventListener('click', async () => {
        const link = linkInput.value.trim();
        if (!link) return alert('⚠️ Tempel dulu linknya Kak!');

        const adalahTikTok = link.includes('tiktok.com');
        const adalahIG = link.includes('instagram.com') || link.includes('instagr.am');

        if (!adalahTikTok && !adalahIG) {
            return alert('❌ Link tidak didukung!\nHanya: TikTok & Instagram');
        }

        btnCek.innerText = "⌛ Memproses...";
        btnCek.disabled = true;
        daftarKontenEl.innerHTML = `<p class="text-center text-blue-500 col-span-full p-10">⏳ Sedang mengambil data, tunggu sebentar...</p>`;

        try {
            let hasilData;
            if (adalahTikTok) hasilData = await ambilDataDariTikTok(link);
            else if (adalahIG) hasilData = await ambilDataDariIG(link);
            tampilkanHasilDownload(hasilData);
        } catch (err) {
            daftarKontenEl.innerHTML = `<p class="text-center text-red-500 col-span-full p-10">❌ Gagal ambil data: ${err.message}</p>`;
        } finally {
            btnCek.innerText = "Unduh";
            btnCek.disabled = false;
        }
    });
}

// --- AMBIL DATA TIKTOK ---
async function ambilDataDariTikTok(url) {
    try {
        const res = await fetch(`https://ttsave.app/download?query=${encodeURIComponent(url)}`, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        if (data.url) return { judul: data.title || "Video TikTok", tipe: "video", url_file: data.url, url_thumbnail: data.thumbnail || "" };
        throw new Error("Coba sumber lain...");
    } catch {
        try {
            const res2 = await fetch(`https://api.snaptik.app/v1/video?url=${encodeURIComponent(url)}`);
            const data2 = await res2.json();
            if (data2.data && data2.data.video) return { judul: data2.data.title || "Video TikTok", tipe: "video", url_file: data2.data.video[0].url, url_thumbnail: data2.data.thumbnail };
            throw new Error("Coba sumber lain...");
        } catch {
            const res3 = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const data3 = await res3.json();
            if (data3.code === 0 && data3.data) return { judul: data3.data.title || "Video TikTok", tipe: "video", url_file: data3.data.hdplay || data3.data.play, url_thumbnail: data3.data.cover };
            throw new Error("Semua layanan sedang sibuk, coba lagi nanti");
        }
    }
}

// --- ✅ AMBIL DATA INSTAGRAM (VERSI SERVER VERCEL - DIJAMIN JALAN) ---
async function ambilDataDariIG(url) {
    url = url.split('?')[0]; // Bersihkan link

    // ✅ SUMBER UTAMA: IGBANG (Sangat stabil di server luar)
    try {
        const res = await fetch(`https://igbang.com/api/v1/download?url=${encodeURIComponent(url)}`);
        const data = await res.json();

        if (data.success && data.medias && data.medias.length > 0) {
            const item = data.medias[0];
            return {
                judul: item.type === 'video' ? "📹 Instagram Reels / Video" : "🖼️ Instagram Foto",
                tipe: item.type,
                url_file: item.url,
                url_thumbnail: item.thumbnail || item.url
            };
        }
        throw new Error("Coba cadangan 1...");
    }

    // ✅ SUMBER CADANGAN 1: INSTAGRAM-PRIVATE (Kuat)
    catch {
        try {
            const res2 = await fetch(`https://instagram-private-api.vercel.app/api/download?url=${encodeURIComponent(url)}`);
            const data2 = await res2.json();

            if (data2.status === "success") {
                return {
                    judul: data2.data[0].type === 'video' ? "📹 Instagram Reels / Video" : "🖼️ Instagram Foto",
                    tipe: data2.data[0].type,
                    url_file: data2.data[0].url,
                    url_thumbnail: data2.data[0].thumbnail || ""
                };
            }
            throw new Error("Coba cadangan 2...");
        }

        // ✅ SUMBER CADANGAN 2: SSSINSTA (Paling legendaris)
        catch {
            try {
                const res3 = await fetch(`https://sssinsta.com/action/download?url=${encodeURIComponent(url)}`);
                const data3 = await res3.json();

                if (data3.links && data3.links.length > 0) {
                    const linkValid = data3.links.find(l => l.url);
                    if (linkValid) {
                        const tipe = linkValid.type.includes('mp4') ? 'video' : 'gambar';
                        return {
                            judul: tipe === 'video' ? "📹 Instagram Reels / Video" : "🖼️ Instagram Foto",
                            tipe: tipe,
                            url_file: linkValid.url,
                            url_thumbnail: ""
                        };
                    }
                }
                throw new Error("Gagal total, pastikan link & akun publik");
            }
            catch {
                throw new Error("❌ Gagal Ambil Data IG. Coba di Vercel, localhost sering diblokir browser.");
            }
        }
    }
}

// --- TAMPILKAN HASILNYA ---
function tampilkanHasilDownload(dataMedia) {
    daftarKontenEl.innerHTML = '';
    const kartu = buatKartuKonten(dataMedia, false);
    daftarKontenEl.appendChild(kartu);
    linkInput.value = '';
}

// ==================================================
// ⬇️ 10. FITUR UNDUH & BAGIKAN
// ==================================================
document.addEventListener('click', async function (e) {
    // === TOMBOL UNDUH ===
    if (e.target.classList.contains('btn-unduh')) {
        const url = e.target.getAttribute('data-url');
        const namaFileAsli = url.split('/').pop().split('?')[0] || "file_unduhan";
        const waktu = new Date().getTime();
        const namaFile = namaFileAsli.length < 5 ? `Video_${waktu}.mp4` : namaFileAsli;

        let pemrosesProgres;

        try {
            e.target.innerText = "0%";
            e.target.disabled = true;

            const isAplikasiHP = window.Capacitor && window.Capacitor.isNativePlatform();

            if (isAplikasiHP) {
                const { Filesystem } = Capacitor.Plugins;
                const izin = await Filesystem.requestPermissions();
                if (izin.publicStorage !== 'granted' && izin.storage !== 'granted') {
                    alert("⚠️ Harap Izinkan Akses Penyimpanan!");
                    return;
                }
                pemrosesProgres = await Filesystem.addListener('progress', (dataProgres) => {
                    const persen = Math.round((dataProgres.bytesReceived / dataProgres.totalBytes) * 100);
                    e.target.innerText = persen + "%";
                });
                await Filesystem.downloadFile({ url: url, path: namaFile, directory: "DOCUMENTS", progress: true });
                await Filesystem.stat({ path: namaFile, directory: "DOCUMENTS" });
                alert(`✅ BERHASIL DISIMPAN!\n\n📂 Lokasi:\nPenyimpanan Internal > Documents > ${namaFile}`);

            } else {
                // --- DI WEB: LANGSUNG DOWNLOAD, TANPA TAB BARU ---
                e.target.innerText = "⌛ Menyiapkan...";
                const res = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit' });
                if (!res.ok) throw new Error("Gagal ambil file");
                const blob = await res.blob();
                const linkUnduh = document.createElement('a');
                linkUnduh.href = URL.createObjectURL(blob);
                linkUnduh.download = namaFile;
                linkUnduh.style.display = 'none';
                document.body.appendChild(linkUnduh);
                linkUnduh.click();
                document.body.removeChild(linkUnduh);
                URL.revokeObjectURL(linkUnduh.href);
                alert("✅ Sedang Mengunduh... Cek folder Unduhan!");
            }

        } catch (err) {
            alert("❌ Gagal: " + err.message + "\n\nCoba lagi atau buka videonya dulu.");
        } finally {
            if (pemrosesProgres) pemrosesProgres.remove();
            e.target.innerText = "Unduh";
            e.target.disabled = false;
        }
    }

    // === TOMBOL BAGIKAN ===
    if (e.target.classList.contains('btn-bagikan')) {
        const url = e.target.getAttribute('data-url');
        const judul = e.target.closest('.bg-white')?.querySelector('h3')?.innerText || 'Konten Keren';
        if (window.Capacitor?.isNativePlatform() && Capacitor.Plugins.Share) {
            Capacitor.Plugins.Share.share({ title: judul, text: "Dapatkan video keren di sini!", url: url });
        } else if (navigator.share) {
            navigator.share({ title: judul, url: url });
        } else {
            alert("Link:\n" + url);
        }
    }
});