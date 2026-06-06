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

// === ELEMEN BARU: LOGIN / PROFIL ===
const btnProfil = document.getElementById('btnProfil');
const modalProfil = document.getElementById('modalProfil');
const kotakModal = document.getElementById('kotakModal');
const tutupModal = document.getElementById('tutupModal');
const judulModal = document.getElementById('judulModal');
const pesanAkun = document.getElementById('pesanAkun');
const formLogin = document.getElementById('formLogin');
const formDaftar = document.getElementById('formDaftar');
const menuProfil = document.getElementById('menuProfil');
const keDaftar = document.getElementById('keDaftar');
const keLogin = document.getElementById('keLogin');
const emailLogin = document.getElementById('emailLogin');
const passLogin = document.getElementById('passLogin');
const btnMasuk = document.getElementById('btnMasuk');
const emailDaftar = document.getElementById('emailDaftar');
const passDaftar = document.getElementById('passDaftar');
const btnBuatAkun = document.getElementById('btnBuatAkun');
const btnKeluar = document.getElementById('btnKeluar');
const emailPengguna = document.getElementById('emailPengguna');
const tandaLogin = document.getElementById('tandaLogin');

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

    // === JALANKAN FUNGSI LOGIN ===
    inisialisasiMenuLogin();
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
// 🃏 7. BIKIN TAMPILAN KARTU ✅ PERBAIKAN ERROR + THUMB OTOMATIS
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
                    src="${data.url_file}" 
                    alt="${data.judul}" 
                    class="max-w-full max-h-full w-auto h-auto object-contain" 
                    loading="lazy"
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

    // === 🔵 MODE VIDEO: ✅ ADA GAMBAR SAMBUNGAN, TAPI TIDAK NYEDOT DATA BESAR ===
    else {
        if (data.tipe === 'video') {
            div.innerHTML = `
                <div class="w-full relative konten-media cursor-pointer bg-gray-100 dark:bg-gray-900/50">
                    <canvas id="canvas-thumb-${data.id}" class="w-full h-auto object-cover" style="display: block;"></canvas>
                    
                    <video 
                        class="w-full h-auto absolute top-0 left-0 z-10" 
                        preload="none"
                        playsinline
                        muted
                        style="display: none;" 
                        data-sumber="${data.url_file}"> 
                    </video>
                    
                    <div class="ikon-play-tengah absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-300">
                        <div class="w-16 h-16 flex items-center justify-center rounded-full bg-black/30 text-white text-2xl backdrop-blur-sm">▶️</div>
                    </div>
                </div>
                <div class="p-3">
                    <h3 class="font-medium text-sm mb-2 line-clamp-1">${data.judul}</h3>
                    <div class="flex gap-2">
                        <button class="btn-unduh flex-1 bg-utama text-white text-xs py-2 rounded-lg" data-url="${data.url_file}">Unduh</button>
                        <button class="btn-bagikan flex-1 bg-gray-200 dark:bg-gray-700 text-xs py-2 rounded-lg" data-url="${data.url_file}">Bagikan</button>
                    </div>
                </div>
            `;

            const videoEl = div.querySelector('video');
            const wadahVideoEl = div.querySelector('.konten-media');
            const ikonPlayEl = div.querySelector('.ikon-play-tengah');
            const canvasEl = div.querySelector(`#canvas-thumb-${data.id}`);

            // ==============================================
            // ✅ BAGIAN PENTING: BIKIN GAMBAR SAMBUNGAN 
            // ==============================================
            const ctx = canvasEl.getContext('2d');

            // PERBAIKAN: Jika ada url_thumbnail, pakai itu agar tidak membebani memori/jaringan
            if (data.url_thumbnail && data.url_thumbnail.trim() !== '') {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = function () {
                    canvasEl.width = img.width;
                    canvasEl.height = img.height;
                    ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
                };
                img.src = data.url_thumbnail;
            }
            // Jika tidak ada thumbnail, baru jalankan videoSementara milikmu
            else {
                const videoSementara = document.createElement('video');
                videoSementara.crossOrigin = "anonymous";
                videoSementara.preload = "metadata";
                videoSementara.muted = true;
                videoSementara.playsinline = true;
                videoSementara.src = data.url_file;

                videoSementara.onloadedmetadata = function () {
                    videoSementara.currentTime = 0.1;
                };

                videoSementara.onseeked = function () {
                    canvasEl.width = videoSementara.videoWidth;
                    canvasEl.height = videoSementara.videoHeight;
                    ctx.drawImage(videoSementara, 0, 0, canvasEl.width, canvasEl.height);

                    videoSementara.src = "";
                    videoSementara.load();
                };
            }

            // ==============================================
            // === LOGIKA KLIK PUTAR / JEDA (PERBAIKAN NGADAT) ===
            // ==============================================
            wadahVideoEl.addEventListener('click', () => {
                // 🔄 MATIKAN SEMUA VIDEO LAIN YANG SEDANG BERJALAN
                document.querySelectorAll('video').forEach(vidLain => {
                    if (vidLain !== videoEl && !vidLain.paused) {
                        vidLain.pause();
                        vidLain.muted = true;
                        vidLain.style.display = 'none';
                        vidLain.parentElement.querySelector('.ikon-play-tengah').classList.remove('opacity-0');
                        vidLain.parentElement.querySelector('canvas').classList.remove('opacity-0');
                    }
                });

                // ✅ BARU MULAI MUAT DATA VIDEO ASLI KETIKA DIKLIK
                if (!videoEl.src || videoEl.src === window.location.href) {
                    videoEl.src = videoEl.getAttribute('data-sumber');
                    videoEl.load(); // Mulai sedot data
                }

                // === PUTAR ===
                if (videoEl.paused) {
                    // Beri penanda loading visual (opsional tapi bagus untuk UX)
                    ikonPlayEl.innerHTML = `<div class="w-16 h-16 flex items-center justify-center rounded-full bg-black/50 text-white text-sm backdrop-blur-sm">⏳</div>`;

                    // PERBAIKAN: Gunakan Promise agar tidak ngadat karena dipaksa putar sebelum buffer
                    let playPromise = videoEl.play();

                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            // Video sukses diputar (sudah buffering)
                            canvasEl.classList.add('opacity-0');
                            videoEl.style.display = 'block';
                            videoEl.muted = false;
                            ikonPlayEl.classList.add('opacity-0');

                            // Kembalikan icon play ke default untuk nanti jika di-pause
                            setTimeout(() => {
                                ikonPlayEl.innerHTML = `<div class="w-16 h-16 flex items-center justify-center rounded-full bg-black/30 text-white text-2xl backdrop-blur-sm">▶️</div>`;
                            }, 300);
                        }).catch(error => {
                            // Jika terganggu/belum siap, kembalikan tampilan
                            console.log("Menunggu buffer / tertunda: ", error);
                            ikonPlayEl.innerHTML = `<div class="w-16 h-16 flex items-center justify-center rounded-full bg-black/30 text-white text-2xl backdrop-blur-sm">▶️</div>`;
                        });
                    }
                }
                // === JEDA ===
                else {
                    videoEl.pause();
                    videoEl.style.display = 'none';
                    canvasEl.classList.remove('opacity-0');
                    ikonPlayEl.classList.remove('opacity-0');
                }
            });

            // === KETIKA VIDEO HABIS BERMAIN ===
            videoEl.addEventListener('ended', () => {
                videoEl.style.display = 'none';
                canvasEl.classList.remove('opacity-0');
                ikonPlayEl.classList.remove('opacity-0');
            });

        }
        // === BAGIAN GAMBAR BIASA (TETAP SAMA) ===
        else {
            div.innerHTML = `
                <div class="w-full flex justify-center bg-gray-50 dark:bg-gray-900/20 konten-media">
                    <img 
                        src="${data.url_file}" 
                        alt="${data.judul}" 
                        class="max-w-full max-h-[450px] w-auto h-auto object-contain" 
                        loading="lazy"
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
// 🆕 9. FITUR UTAMA: DOWNLOAD DARI LINK IG / TIKTOK ✅ SISTEM FASTDL.APP
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

// --- ✅ AMBIL DATA INSTAGRAM (DIPERBARUI: SISTEM FASTDL TERBARU) ---
async function ambilDataDariIG(url) {
    url = url.split('?')[0];
    const linkMurni = encodeURIComponent(url);

    try {
        const res = await fetch(`https://api.fastdl.app/ig?url=${linkMurni}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Origin': 'https://fastdl.app',
                'Referer': 'https://fastdl.app/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!res.ok) throw new Error("API utama tidak merespon");
        const data = await res.json();

        if (data.status === "success" && data.data?.medias?.length > 0) {
            const media = data.data.medias[0];
            return {
                judul: media.type === 'video' ? "📹 Instagram Reels" : "🖼️ Instagram Foto",
                tipe: media.type,
                url_file: media.url,
                url_thumbnail: media.thumbnail || media.url
            };
        }
        throw new Error("Data tidak ditemukan di API utama");
    }

    catch {
        try {
            const res2 = await fetch(`https://api.instadl.app/process?link=${linkMurni}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data2 = await res2.json();

            if (data2.success && data2.files?.length > 0) {
                const file = data2.files[0];
                return {
                    judul: file.ext === 'mp4' ? "📹 Instagram Reels" : "🖼️ Instagram Foto",
                    tipe: file.ext === 'mp4' ? 'video' : 'gambar',
                    url_file: file.url,
                    url_thumbnail: file.thumb || ""
                };
            }
            throw new Error("Cadangan 1 gagal");
        }

        catch {
            try {
                const res3 = await fetch(`https://igdownloader.app/api/ajaxSearch`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Referer': 'https://igdownloader.app/'
                    },
                    body: `q=${linkMurni}&t=media&lang=en`
                });
                const data3 = await res3.json();

                if (data3.status === "ok") {
                    const linkVideo = data3.data.match(/href="([^"]+\.mp4[^"]*)"/);
                    const linkGambar = data3.data.match(/href="([^"]+\.jpg[^"]*)"/);

                    if (linkVideo?.[1]) {
                        return { judul: "📹 Instagram Reels", tipe: "video", url_file: linkVideo[1], url_thumbnail: "" };
                    }
                    if (linkGambar?.[1]) {
                        return { judul: "🖼️ Instagram Foto", tipe: "gambar", url_file: linkGambar[1], url_thumbnail: linkGambar[1] };
                    }
                }
                throw new Error("Cadangan 2 gagal");
            }

            catch {
                throw new Error(`
❌ Konten dibatasi Instagram!

Link yang kamu kirim:
${url}

Saat ini IG menerapkan pembatasan ketat:
- Wajib login untuk melihat meski akun publik
- Memblokir akses langsung dari situs lain
- Hanya bisa diakses lewat server proxy khusus

✅ Solusi:
1. Coba lewat fastdl.app dulu untuk memastikan
2. Atau gunakan server proxy sendiri nanti
                `);
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

// ==================================================
// 👤 FITUR LOGIN / PROFIL - VERSI PERBAIKAN TOTAL ✅
// ==================================================
function inisialisasiMenuLogin() {

    btnProfil.addEventListener('click', async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (user) {
            tampilkanMenuProfil(user);
        } else {
            tampilkanFormLogin();
        }

        modalProfil.classList.remove('hidden');
        setTimeout(() => kotakModal.classList.remove('scale-95', 'opacity-0'), 10);
    });

    tutupModal.addEventListener('click', tutupSemuaModal);
    modalProfil.addEventListener('click', (e) => e.target === modalProfil && tutupSemuaModal());

    keDaftar.addEventListener('click', (e) => { e.preventDefault(); tampilkanFormDaftar(); });
    keLogin.addEventListener('click', (e) => { e.preventDefault(); tampilkanFormLogin(); });

    btnMasuk.addEventListener('click', async () => {
        tampilkanPesan('⌛ Sedang masuk...', 'info');

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: emailLogin.value,
            password: passLogin.value
        });

        if (error) return tampilkanPesan('❌ ' + error.message, 'salah');

        tampilkanPesan('✅ Berhasil masuk!', 'benar');
        updateStatusUser(data.user);

        setTimeout(() => {
            tutupSemuaModal();
        }, 1200);
    });

    btnBuatAkun.addEventListener('click', async () => {
        tampilkanPesan('⌛ Membuat akun...', 'info');
        const { data, error } = await supabaseClient.auth.signUp({
            email: emailDaftar.value,
            password: passDaftar.value
        });
        if (error) return tampilkanPesan('❌ ' + error.message, 'salah');
        tampilkanPesan('✅ Akun dibuat! Silakan masuk.', 'benar');
    });

    btnKeluar.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        updateStatusUser(null);
        tutupSemuaModal();
    });

    cekDanPerbaruiStatusUserSaatMulai();
}

// ==================================================
// ⚙️ FUNGSI BANTUAN (VERSI BERSIH, DUPLIKAT DIHAPUS)
// ==================================================

function tutupSemuaModal() {
    kotakModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => modalProfil.classList.add('hidden'), 200);
    pesanAkun.classList.add('hidden');
}

function tampilkanFormLogin() {
    judulModal.innerText = "Masuk Akun";
    formLogin.classList.remove('hidden');
    formDaftar.classList.add('hidden');
    menuProfil.classList.add('hidden');
    pesanAkun.classList.add('hidden');
}

function tampilkanFormDaftar() {
    judulModal.innerText = "Daftar Akun Baru";
    formLogin.classList.add('hidden');
    formDaftar.classList.remove('hidden');
    menuProfil.classList.add('hidden');
    pesanAkun.classList.add('hidden');
}

function tampilkanMenuProfil(userData) {
    // ✅ Judul berubah jadi Profil, parameter userData opsional untuk jaga-jaga
    judulModal.innerText = "✅ Profil Saya";
    formLogin.classList.add('hidden');
    formDaftar.classList.add('hidden');
    pesanAkun.classList.add('hidden');

    if (userData && userData.email) {
        emailPengguna.innerText = userData.email;
    }
    menuProfil.classList.remove('hidden');
}

function tampilkanPesan(teks, jenis) {
    pesanAkun.classList.remove('hidden');
    pesanAkun.innerText = teks;
    pesanAkun.className = "text-sm text-center p-2 rounded-lg mt-3 " + (
        jenis === 'benar' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
            jenis === 'salah' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    );
}

function updateStatusUser(user) {
    if (user) {
        tandaLogin.classList.remove('hidden'); // ✅ Tampilkan titik hijau
        emailPengguna.innerText = user.email;  // ✅ TAMPILKAN EMAIL DI MENU PROFIL
    } else {
        tandaLogin.classList.add('hidden');
        emailPengguna.innerText = '';
    }
}

async function cekDanPerbaruiStatusUserSaatMulai() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    updateStatusUser(user);
}

function cekStatusLogin() {
    return !!supabaseClient.auth.currentUser;
}