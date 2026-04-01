/* 
   JARVIS AI REMOTE WIDGET - FIXED VERSION 2026
   Fix: Tracking Prevention & 422 Error
*/

async function startJarvisPortal() {
    const apiKey = "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";
    const keyword = document.getElementById('jarvis-portal-input').value;
    const btn = document.getElementById('jarvis-portal-btn');
    const displayArea = document.getElementById('jarvis-output-text');
    const blogId = "2993587733256297709";

    if(!keyword) return alert("Masukkan Judul Berita!");

    btn.innerText = "⏳ MEMINDAI MSN...";
    btn.disabled = true;
    displayArea.style.display = "none";

    try {
        // 1. CARI BERITA MSN (Perbaikan URL agar tidak Error 422)
        // Kita gunakan site:msn.com saja, hl=id & gl=ID sudah otomatis memfilter bahasa Indonesia
        const query = encodeURIComponent(`site:msn.com ${keyword}`);
        const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=id&gl=ID&ceid=ID:id`;
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        const resNews = await fetch(proxyUrl);
        const dataNews = await resNews.json();
        
        if (dataNews.status !== 'ok') throw new Error("Gagal mengambil data berita.");
        
        const facts = dataNews.items ? dataNews.items.slice(0,3).map(i => i.title).join(". ") : "";

        btn.innerText = "✍️ AI WRITING...";

        // 2. PANGGIL AI
        const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`},
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: `Tulis berita HTML unik (anti-plagiat) berdasarkan fakta: ${facts}. Judul: ${keyword}. Minimal 500 kata. Di akhir buat daftar <ul><li> link sumber asli MSN dari data tersebut.`}]
            })
        });

        const aiData = await aiRes.json();
        const contentHtml = aiData.choices[0].message.content;

        // 3. TAMPILKAN HASIL (Ganti sistem Auto-Copy ke Manual Copy untuk keamanan browser)
        displayArea.value = contentHtml;
        displayArea.style.display = "block";
        
        alert("✅ ARTIKEL SELESAI!\n\nSilakan klik 'SALIN HASIL', lalu pindah ke Editor Blogger.");

    } catch (err) {
        alert("Terjadi Gangguan: " + err.message);
        console.error(err);
    } finally {
        btn.innerText = "⚡ GENERATE ULANG";
        btn.disabled = false;
    }
}

function copyJarvisResult() {
    const copyText = document.getElementById("jarvis-output-text");
    copyText.select();
    document.execCommand("copy");
    alert("Hasil tersalin ke clipboard!");
    const blogId = "2993587733256297709";
    window.open(`https://www.blogger.com/blog/post/new/${blogId}`, '_blank');
}
