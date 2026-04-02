/**
 * J.A.R.V.I.S AI ENGINE V12 - SMART DATA EXTRACTION
 * Update: Fokus pada Penarikan Paragraf Berita & Perintah Mutlak
 */

const JARVIS_CONFIG = {
    apiKey: "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",
    model: "llama-3.3-70b-versatile"
};

async function startJarvisPortal() {
    const urlInput = document.getElementById('jarvis-portal-input');
    const cmdInput = document.getElementById('jarvis-command-input');
    const status = document.getElementById('jarvis-status-log');
    const output = document.getElementById('jarvis-output-text');
    const resultArea = document.getElementById('jarvis-result-area');
    const btn = document.getElementById('jarvis-portal-btn');

    if (!cmdInput.value) { alert("Sistem memerlukan instruksi, Tuan."); return; }

    btn.disabled = true;
    btn.innerText = "SCRAPPING...";
    status.style.display = "block";
    resultArea.style.display = "none";
    status.innerText = "> SCANNING TARGET CONTENT...";

    let newsData = "";

    try {
        if (urlInput.value) {
            status.innerText = "> BYPASSING GATEWAY & FILTERING NOISE...";
            const targetUrl = urlInput.value.trim();
            const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
            
            const response = await fetch(proxy);
            const data = await response.json();
            
            if (!data.contents) throw new Error("Gagal menarik data. Media memproteksi kontennya.");

            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            
            // Hapus elemen yang bukan isi berita
            doc.querySelectorAll('script, style, nav, footer, header, aside, .sidebar, .ads, .komentar, .footer-ads').forEach(j => j.remove());
            
            // TEKNIK BARU: Ambil hanya teks dari paragraf berita (P tags)
            // Ini membuang 90% teks menu navigasi
            const contentArea = doc.querySelector('article') || doc.querySelector('.read__content') || doc.querySelector('.entry-content') || doc.body;
            const paragraphs = contentArea.querySelectorAll('p');
            
            let collectedText = "";
            paragraphs.forEach(p => {
                const txt = p.innerText.trim();
                // Hanya ambil paragraf yang panjangnya > 40 karakter (menghindari teks menu singkat)
                if (txt.length > 40) collectedText += txt + "\n\n";
            });

            newsData = collectedText.substring(0, 9000); // Batas 9000 karakter
            
            if (newsData.length < 150) {
                // Fallback jika tidak ada tag P yang ditemukan
                newsData = contentArea.innerText.replace(/\s+/g, ' ').trim().substring(0, 9000);
            }
        }

        status.innerText = "> EXECUTING COMMAND ON AI CORE...";

        const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JARVIS_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: JARVIS_CONFIG.model,
                messages: [
                    {
                        role: "system",
                        content: `Kamu adalah J.A.R.V.I.S News Editor Pro. 
                        TUGAS UTAMAMU: Mengolah data referensi berita menjadi sebuah artikel Blogger sesuai PERINTAH USER.
                        
                        SYARAT MUTLAK:
                        1. Abaikan semua teks iklan atau menu navigasi dalam referensi.
                        2. Fokus HANYA pada isi cerita/berita yang ada dalam teks.
                        3. Ikuti PERINTAH USER (format, gaya bahasa, struktur) secara mutlak tanpa kompromi.
                        4. Output harus dalam format HTML Blogger (<div class="entry-content">).
                        5. Jangan ada kata pengantar. Berikan KODE HTML LANGSUNG.`
                    },
                    {
                        role: "user",
                        content: `REFERENSI BERITA ASLI:\n${newsData}\n\nPERINTAH USER (HUKUM UTAMA):\n${cmdInput.value}`
                    }
                ],
                temperature: 0.7
            })
        });

        const aiData = await aiRes.json();
        if (aiData.error) throw new Error(aiData.error.message);

        output.value = aiData.choices[0].message.content;
        resultArea.style.display = "block";
        status.innerText = "> TRANSMISI SELESAI. DATA SESUAI PERINTAH.";

    } catch (err) {
        status.innerText = "> SYSTEM_ERROR: " + err.message;
        status.style.color = "#ff4444";
    } finally {
        btn.disabled = false;
        btn.innerText = "⚡ RUN GENERATOR";
    }
}

window.copyJarvisResult = function() {
    const copyText = document.getElementById("jarvis-output-text");
    copyText.select();
    document.execCommand("copy");
    alert("KODE HTML DISALIN!");
};
