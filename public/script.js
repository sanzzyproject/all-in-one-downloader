// Function untuk Fetch Data Media
async function fetchMedia() {
    const input = document.getElementById('urlInput');
    const btn = document.getElementById('downloadBtn');
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const errorCard = document.getElementById('error-msg');
    const errorText = document.getElementById('error-text');
    const url = input.value.trim();

    if (!url) return;

    // Reset UI
    btn.disabled = true;
    loading.classList.remove('hidden');
    resultDiv.innerHTML = '';
    errorCard.classList.add('hidden');

    try {
        const response = await fetch('/api/index', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            throw new Error(json.error || 'Media tidak ditemukan.');
        }

        renderResult(json.data);

    } catch (err) {
        errorText.textContent = err.message;
        errorCard.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        loading.classList.add('hidden');
    }
}

// Function Render Hasil ke UI
function renderResult(medias) {
    const resultDiv = document.getElementById('result');

    medias.forEach((media, index) => {
        // Buat elemen card baru
        const card = document.createElement('div');
        card.className = 'brutalist-card';

        // Tentukan Judul Tipe
        let typeTitle = 'MEDIA';
        let mediaPreview = '';

        if (media.type === 'video') {
            typeTitle = `VIDEO ${media.quality || ''}`;
            mediaPreview = `
                <video controls poster="${media.thumbnail || ''}">
                    <source src="${media.url}" type="video/mp4">
                </video>`;
        } else if (media.type === 'image') {
            typeTitle = 'IMAGE';
            mediaPreview = `<img src="${media.url}" alt="Image Result">`;
        } else if (media.type === 'audio') {
            typeTitle = 'AUDIO';
            mediaPreview = `
                <audio controls style="width:100%; margin-bottom:10px;">
                    <source src="${media.url}" type="audio/mpeg">
                </audio>`;
        }

        // Tentukan nama file
        const ext = media.extension || (media.type === 'video' ? 'mp4' : media.type === 'audio' ? 'mp3' : 'jpg');
        const filename = `downloader_result_${index + 1}.${ext}`;

        // HTML Isi Card
        card.innerHTML = `
            <div class="brutalist-card__header">
                <div class="brutalist-card__icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"></path>
                    </svg>
                </div>
                <div class="brutalist-card__alert">SUCCESS</div>
            </div>
            <div class="brutalist-card__message">
                <div>${typeTitle}</div>
                ${mediaPreview}
            </div>
            <div class="brutalist-card__actions">
                <button class="brutalist-card__button brutalist-card__button--mark" 
                    onclick="forceDownload('${media.url}', '${filename}', this)">
                    DOWNLOAD NOW
                </button>
            </div>
        `;

        resultDiv.appendChild(card);
    });
}

// Function Force Direct Download
async function forceDownload(url, filename, btnElement) {
    const originalText = btnElement.innerText;
    btnElement.innerText = "DOWNLOADING...";
    btnElement.disabled = true;

    try {
        // Coba fetch sebagai blob untuk direct download
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error");
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        
        a.click();
        
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);

    } catch (e) {
        console.error("Direct download failed, opening in new tab", e);
        // Fallback jika CORS memblokir (misal TikTok kadang strict)
        // Kita buka linknya langsung
        window.location.href = url; 
    } finally {
        btnElement.innerText = "DOWNLOADED";
        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.disabled = false;
        }, 2000);
    }
}
