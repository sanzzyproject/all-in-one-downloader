// Function Fetch Data
async function fetchMedia() {
    const input = document.getElementById('urlInput');
    const btn = document.getElementById('downloadBtn');
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const errorMsg = document.getElementById('error-msg');
    const url = input.value.trim();

    if (!url) return;

    // UI Reset
    btn.disabled = true; // Disable tombol saat loading
    loading.classList.remove('hidden');
    resultDiv.innerHTML = '';
    errorMsg.classList.add('hidden');

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
        errorMsg.textContent = "❌ ERROR: " + err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        loading.classList.add('hidden');
    }
}

// Function Render Hasil
function renderResult(medias) {
    const resultDiv = document.getElementById('result');

    medias.forEach((media, index) => {
        const container = document.createElement('div');
        container.className = 'media-container';

        let contentPreview = '';
        let typeLabel = 'MEDIA';

        if (media.type === 'video') {
            typeLabel = `VIDEO (${media.quality || 'HD'})`;
            contentPreview = `
                <video controls poster="${media.thumbnail || ''}">
                    <source src="${media.url}" type="video/mp4">
                </video>`;
        } else if (media.type === 'image') {
            typeLabel = 'IMAGE';
            contentPreview = `<img src="${media.url}" alt="Result">`;
        } else if (media.type === 'audio') {
            typeLabel = 'AUDIO';
            contentPreview = `
                <audio controls style="width:100%; margin-top:10px;">
                    <source src="${media.url}" type="audio/mpeg">
                </audio>`;
        }

        const ext = media.extension || (media.type === 'video' ? 'mp4' : 'jpg');
        const filename = `comic_dl_${Date.now()}_${index}.${ext}`;

        // HTML Structure using COMIC BUTTON for download
        container.innerHTML = `
            <div style="background:black; color:white; padding:5px 10px; display:inline-block; font-weight:bold; margin-bottom:10px; transform:rotate(-2deg);">
                ${typeLabel}
            </div>
            ${contentPreview}
            
            <div class="comic-brutal-button-container" style="padding: 0; margin-top: 15px;">
                <button class="comic-brutal-button" onclick="forceDownload('${media.url}', '${filename}', this)">
                    <div class="button-inner" style="background: var(--secondary);">
                        <span class="button-text">DOWNLOAD NOW!</span>
                        <div class="halftone-overlay"></div>
                    </div>
                    <div class="button-shadow"></div>
                    <div class="button-frame"></div>
                </button>
            </div>
        `;

        resultDiv.appendChild(container);
    });
}

// Function Force Download (Auto Download)
async function forceDownload(url, filename, btnElement) {
    const textSpan = btnElement.querySelector('.button-text');
    const originalText = textSpan.innerText;
    
    textSpan.innerText = "WAIT...";
    btnElement.disabled = true;

    try {
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
        console.error("Direct download failed", e);
        window.location.href = url; // Fallback open link
    } finally {
        textSpan.innerText = "DONE!";
        setTimeout(() => {
            textSpan.innerText = originalText;
            btnElement.disabled = false;
        }, 2000);
    }
}
