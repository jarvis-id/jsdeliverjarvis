/**
 * J.A.R.V.I.S AI ENGINE V10 - COMMAND-CENTRIC
 * Update: Fokus Mutlak pada Instruksi Pengguna
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

    if (!cmdInput.value) { alert("Tuan, sistem tidak bisa bekerja tanpa perintah spesifik."); return; }

    btn.disabled = true;
    btn.innerText = "PROCESSING COMMAND...";
    status.style.display = "block";
    resultArea.style.display = "none";
    status.innerText = "> ANALYZING YOUR COMMANDS...";

    let rawContent = "";

    try {
        // PROSES SCRAPING (Hanya jika ada URL)
        if (urlInput.value) {
            status.innerText = "> EXTRACTING DATA FROM SOURCE...";
            const proxies = [
                `https://corsproxy.io/?url=${encodeURIComponent(urlInput.value)}`,
                `https://api.allorigins.win/get?url=${encodeURIComponent(urlInput.value)}`
            ];

            let success = false;
            for (let proxy of proxies) {
                try {
                    const response = await fetch(proxy);
                    if (!response.ok) continue;
                    let html = proxy.includes('allorigins') ? (await response.json()).contents : await response.text();
                    if (html) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        doc.querySelectorAll('script, style, nav, footer, header, aside, .ads').forEach(n => n.remove());
                        rawContent = doc.body.innerText.replace(/\s+/g, ' ').trim().substring(0, 9500);
                        if (rawContent.length > 200) { success = true; break; }
                    }
                } catch (e) {}
            }
        }

        status.innerText = "> EXECUTING YOUR SPECIFIC ORDERS...";

        // REQUEST AI DENGAN PRIORITAS PADA PERINTAH USER
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
                        content: `Kamu adalah asisten editor J.A.R.V.I.S. 
                        Tugas utamamu adalah MENGIKUTI PERINTAH USER SECARA MUTLAK. 
                        Teks berita yang diberikan hanyalah REFERENSI DATA. 
                        
                        ATURAN KERJA:
                        1. Prioritaskan format, gaya bahasa, dan struktur sesuai 'PERINTAH USER'.
                        2. Jika user minta diskusi, buat diskusi. Jika user minta ringkasan, buat ringkasan. Jika user minta gaya bahasa santai, buat santai.
                        3. Hasil akhir HARUS dalam format HTML Blogger (bungkus dengan <div class="entry-content">).
                        4. Gunakan tag <h2>, <p>, <strong>, <ul>, <li> secara rapi.
                        5. Jangan memberikan komentar seperti 'Ini hasilnya' atau 'Berikut adalah artikelnya'. Berikan kode HTML langsung.`
                    },
                    {
                        role: "user",
                        content: `REFERENSI BERITA:\n${rawContent || "Tidak ada URL, gunakan pengetahuanmu."}\n\nPERINTAH USER (WAJIB DIIKUTI):\n${cmdInput.value}`
                    }
                ],
                temperature: 0.7 // Dinaikkan sedikit agar AI lebih fleksibel mengikuti instruksi kreatif
            })
        });

        const aiData = await aiRes.json();
        if (aiData.error) throw new Error(aiData.error.message);

        output.value = aiData.choices[0].message.content;
        resultArea.style.display = "block";
        status.innerText = "> COMMAND EXECUTED SUCCESSFULLY.";

    } catch (err) {
        status.innerText = "> ERROR: " + err.message;
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
