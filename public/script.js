async function downloadMedia() {
    const input = document.getElementById('urlInput');
    const btn = document.getElementById('downloadBtn');
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const errorMsg = document.getElementById('error-msg');
    const url = input.value.trim();

    if (!url) return;

    // Reset UI
    btn.disabled = true;
    loading.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    errorMsg.classList.add('hidden');
    resultDiv.innerHTML = '';

    try {
        // Panggil Backend API kita sendiri
        const response = await fetch('/api/index', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            throw new Error(json.error || 'Gagal mengambil data.');
        }

        renderResult(json.data);

    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        loading.classList.add('hidden');
    }
}

function renderResult(medias) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden');

    medias.forEach(media => {
        const card = document.createElement('div');
        card.className = 'media-card';

        let content = '';

        if (media.type === 'video') {
            content = `
                <h4>Video (${media.quality || 'HD'})</h4>
                <video controls poster="${media.thumbnail || ''}">
                    <source src="${media.url}" type="video/mp4">
                    Browser Anda tidak mendukung tag video.
                </video>
            `;
        } else if (media.type === 'image') {
            content = `
                <h4>Gambar</h4>
                <img src="${media.url}" alt="Downloaded Media">
            `;
        } else if (media.type === 'audio') {
            content = `
                <h4>Audio</h4>
                <audio controls>
                    <source src="${media.url}" type="audio/mpeg">
                </audio>
            `;
        }

        content += `<a href="${media.url}" target="_blank" class="download-link" download>Download File</a>`;
        
        card.innerHTML = content;
        resultDiv.appendChild(card);
    });
}
