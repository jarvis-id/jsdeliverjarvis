/**
 * J.A.R.V.I.S AI SCRAPER ENGINE V9
 * Location: https://github.com/jarvis-id/jsdeliverjarvis/main/jarvis-ai.js
 * Function: Universal Web Scraping & Blogger HTML Generation
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

    if (!cmdInput.value) { alert("Sistem memerlukan instruksi redaksi, Tuan."); return; }

    // UI State
    btn.disabled = true;
    btn.innerText = "SCRAPPING...";
    status.style.display = "block";
    resultArea.style.display = "none";
    status.innerText = "> INITIALIZING UNIVERSAL UPLINK...";

    let rawContent = "";

    try {
        if (urlInput.value) {
            status.innerText = "> BYPASSING MEDIA FIREWALL...";
            
            // Triple Proxy Logic for Universal Access
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
                        
                        // Clean Garbage Tags
                        const noise = doc.querySelectorAll('script, style, nav, footer, header, aside, ads, .sidebar, .comments');
                        noise.forEach(n => n.remove());
                        
                        // Universal Content Extraction (Text Density)
                        rawContent = doc.body.innerText.replace(/\s+/g, ' ').trim().substring(0, 10000);
                        
                        if (rawContent.length > 250) { success = true; break; }
                    }
                } catch (e) { console.warn("Proxy Failed:", proxy); }
            }

            if (!success) throw new Error("Media memblokir akses otomatis. Silakan gunakan link media lain atau paste teks secara manual.");
        }

        status.innerText = "> GENERATING BLOGGER HTML STRUCTURE...";

        // AI Request with HTML strictly formatted
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
                        content: `Kamu adalah J.A.R.V.I.S News Editor. Tugasmu adalah mengolah teks berita mentah menjadi kode HTML murni untuk Blogger. 
                        ATURAN WAJIB:
                        1. Selalu bungkus konten dalam <div class="entry-content">.
                        2. Gunakan tag <h2> untuk sub-judul.
                        3. Gunakan tag <p> untuk paragraf.
                        4. Gunakan tag <strong> untuk penekanan kata kunci.
                        5. Gunakan <ul> dan <li> untuk poin-poin.
                        6. Jika ada kutipan, gunakan <blockquote>.
                        7. JANGAN berikan teks basa-basi (seperti "Ini hasilnya"). Berikan HANYA kode HTML.`
                    },
                    {
                        role: "user",
                        content: `SUMBER DATA:\n${rawContent}\n\nPERINTAH REDAKSI:\n${cmdInput.value}`
                    }
                ],
                temperature: 0.5
            })
        });

        const aiData = await aiRes.json();
        const finalHTML = aiData.choices[0].message.content;

        // Display Result
        output.value = finalHTML;
        resultArea.style.display = "block";
        status.innerText = "> TRANSMISI SELESAI. HTML SIAP DICOPY.";

    } catch (err) {
        status.innerText = "> ERROR: " + err.message;
        status.style.color = "#ff4444";
    } finally {
        btn.disabled = false;
        btn.innerText = "⚡ RUN GENERATOR";
    }
}

// Global Copy Function
window.copyJarvisResult = function() {
    const copyText = document.getElementById("jarvis-output-text");
    copyText.select();
    document.execCommand("copy");
    alert("KODE HTML DISALIN!\nTempelkan pada mode HTML di Editor Blogger.");
};
