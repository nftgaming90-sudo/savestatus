// ==================================================
// 🚀 INISIALISASI
// ==================================================
const formUpload = document.getElementById('formUpload');
const tipeRadios = document.querySelectorAll('input[name="tipe"]');
const judulInput = document.getElementById('judulInput');
const fileInput = document.getElementById('fileInput');
const namaFileTerpilih = document.getElementById('namaFileTerpilih');
const teksJenisFile = document.getElementById('teksJenisFile');
const wadahPreview = document.getElementById('wadahPreview');
const previewGambar = document.getElementById('previewGambar');
const previewVideo = document.getElementById('previewVideo');
const wadahProgres = document.getElementById('wadahProgres');
const barProgres = document.getElementById('barProgres');
const persenProgres = document.getElementById('persenProgres');
const pesanUpload = document.getElementById('pesanUpload');
const btnSubmit = document.getElementById('btnSubmit');

// ✅ DATA CLOUDFLARE R2
const R2_UPLOAD_URL = "https://upload-r2-saya.nftgaming90.workers.dev/";
const R2_PUBLIC_DOMAIN = "https://video-cdn-saya.nftgaming90.workers.dev/";

let fileTerpilih = null;
let ekstensiFile = "";

// ==================================================
// ⚡ FILTER FILE
// ==================================================
function updateFilterFile() {
    const tipeAktif = document.querySelector('input[name="tipe"]:checked').value;
    if (tipeAktif === 'video') {
        fileInput.accept = ".mp4,.mov,.avi,.mkv";
        teksJenisFile.innerText = "(MP4 / MOV / AVI)";
    } else if (tipeAktif === 'gambar' || tipeAktif === 'stiker' || tipeAktif === 'gif') {
        fileInput.accept = ".jpg,.jpeg,.png,.webp,.gif";
        teksJenisFile.innerText = "(JPG / PNG / WEBP / GIF)";
    }
}

// Jalankan sekali
updateFilterFile();

tipeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        resetPreview();
        updateFilterFile();
    });
});

// ==================================================
// ✅ FUNGSI PREVIEW
// ==================================================
fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) { resetPreview(); return; }

    fileTerpilih = file;
    ekstensiFile = file.name.split('.').pop().toLowerCase();
    namaFileTerpilih.innerText = `📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

    const objekUrl = URL.createObjectURL(file);
    wadahPreview.classList.remove('hidden');
    wadahPreview.style.display = "block";

    const videoFormat = ['mp4', 'mov', 'avi', 'mkv'];
    const gambarFormat = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    if (videoFormat.includes(ekstensiFile)) {
        previewGambar.style.display = "none";
        previewVideo.style.display = "block";
        previewVideo.src = objekUrl;
        previewVideo.load();
    } else if (gambarFormat.includes(ekstensiFile)) {
        previewVideo.style.display = "none";
        previewGambar.style.display = "block";
        previewGambar.src = objekUrl;
    } else {
        resetPreview();
        tampilkanPesan("❌ Format file tidak didukung", "salah");
    }
});

// ==================================================
// 🚀 PROSES UTAMA - ✅ DIPERBAIKI THUMBNAILNYA
// ==================================================
formUpload.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileTerpilih) return tampilkanPesan("❌ Pilih file dulu bos!", "salah");

    const tipePilih = document.querySelector('input[name="tipe"]:checked').value;
    const judul = judulInput.value.trim() || `Konten ${Date.now()}`;

    btnSubmit.disabled = true;
    wadahProgres.classList.remove('hidden');
    tampilkanPesan("⏳ Sedang memproses...", "info");

    try {
        // ==============================================
        // 1. UPLOAD KE CLOUDFLARE R2
        // ==============================================
        let namaFolderR2;
        if (tipePilih === 'video') {
            namaFolderR2 = 'videos';
        } else if (tipePilih === 'gambar') {
            namaFolderR2 = 'gambar';
        } else if (tipePilih === 'stiker') {
            namaFolderR2 = 'stickers';
        } else if (tipePilih === 'gif') {
            namaFolderR2 = 'gambar';
        }

        const namaFileUnik = `${namaFolderR2}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ekstensiFile}`;
        const urlHasilUpload = await uploadKeR2(fileTerpilih, namaFileUnik);

        tampilkanPesan("⌛ File ada di R2, kirim ke Database...", "info");

        // ==============================================
        // 2. SIMPAN KE SUPABASE (LOGIKA THUMBNAIL DIPERBAIKI)
        // ==============================================

        // 🔥 JIKA VIDEO, KOSONGKAN THUMBNAIL AGAR SCRIPT HALAMAN DEPAN BIKIN CANVAS OTOMATIS
        // 🔥 JIKA GAMBAR, ISI DENGAN URL FILE TERSEBUT
        const urlThumb = (tipePilih === 'video') ? "" : urlHasilUpload;

        const dataUntukDikirim = {
            judul: judul,
            deskripsi: null,
            tipe: tipePilih,
            kategori_id: null,
            url_file: urlHasilUpload,
            url_thumbnail: urlThumb,    // ✅ FIXED: Tidak akan merusak pemutar video lagi
            has_lyrics: false,
            lyrics_url: null,
            jumlah_unduh: 0,
            aktif: true,
            user_id: window.userId
        };

        // ✅ KIRIM KE DATABASE
        const { data, error } = await supabase
            .from('contents')
            .insert(dataUntukDikirim)
            .select();

        if (error) {
            console.error("🔥 ERROR SUPABASE:", error);
            throw new Error(`Gagal Simpan: ${error.message}`);
        }

        tampilkanPesan(`✅ BERHASIL! File: ${namaFileUnik}`, "benar");
        resetForm();

    } catch (err) {
        tampilkanPesan(`❌ Gagal: ${err.message}`, "salah");
        console.error("Kesalahan:", err);
    } finally {
        btnSubmit.disabled = false;
    }
});

// ==================================================
// 🛠️ FUNGSI: UPLOAD KE CLOUDFLARE R2
// ==================================================
async function uploadKeR2(file, namaTujuan) {
    const uploadUrl = `${R2_UPLOAD_URL}${namaTujuan}`;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);

        // Hindari mengirim header yang aneh-aneh agar Worker tidak pusing
        xhr.setRequestHeader("Content-Type", file.type || 'application/octet-stream');

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const persen = Math.round((e.loaded / e.total) * 100);
                barProgres.style.width = persen + "%";
                persenProgres.innerText = persen + "%";
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const linkPublik = `${R2_PUBLIC_DOMAIN}${namaTujuan}`;
                console.log("✅ File R2:", linkPublik);
                resolve(linkPublik);
            } else {
                reject(new Error(`Respon R2: ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error("Koneksi ke R2 gagal (Cek pengaturan CORS di Worker!)"));
        xhr.send(file);
    });
}

// ==================================================
// 🧰 FUNGSI BANTUAN
// ==================================================
function tampilkanPesan(teks, jenis) {
    pesanUpload.classList.remove('hidden');
    pesanUpload.innerText = teks;
    pesanUpload.className = `mb-4 p-3 rounded-lg text-sm text-center ${jenis === 'benar' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
        jenis === 'salah' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
        }`;
}

function resetPreview() {
    wadahPreview.classList.add('hidden');
    wadahPreview.style.display = "none";
    if (previewVideo.src) URL.revokeObjectURL(previewVideo.src);
    if (previewGambar.src) URL.revokeObjectURL(previewGambar.src);
    previewVideo.src = ""; previewGambar.src = ""; fileTerpilih = null;
}

function resetForm() {
    formUpload.reset(); resetPreview();
    wadahProgres.classList.add('hidden'); barProgres.style.width = "0%";
    tipeRadios[0].checked = true; updateFilterFile();
}