/* 
   JARVIS AI BLOGGER MODULE 
   Source: MSN Indonesia (via Google News RSS)
*/

const JARVIS_CONFIG = {
    apiKey: "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", // API Key Anda
    model: "llama-3.3-70b-versatile"
};

// Fungsi Mencari Berita MSN Terbaru
async function fetchMSNNews(keyword) {
    const hariIni = new Date().toISOString().split('T')[0];
    const searchQueries = `site:msn.com/id-id ${keyword}`;
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQueries)}&hl=id&gl=ID&ceid=ID:id`;
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    try {
        const res = await fetch(proxyUrl);
        const data = await res.json();
        return data.items ? data.items.slice(0, 5).map(i => `Judul: ${i.title}\nLink: ${i.link}`).join("\n\n") : "";
    } catch (e) { return ""; }
}

// Fungsi Utama Generate Artikel
async function generateAIArticle() {
    const titleInput = document.getElementById('ai-judul-input');
    const displayArea = document.getElementById('ai-content-output');
    const btn = document.getElementById('btn-ai-exec');
    
    if(!titleInput.value) return alert("Isi judul dulu!");
    
    btn.innerText = "⏳ Sedang Menghubungkan ke Satelit MSN...";
    btn.disabled = true;

    const dataBerita = await fetchMSNNews(titleInput.value);
    
    const prompt = `Tulis artikel berita mendalam berdasarkan data MSN Indonesia terbaru.
    JUDUL: ${titleInput.value}
    DATA SUMBER: ${dataBerita}
    SYARAT: Bahasa Indonesia formal, Minimal 500 kata, 100% unik (parafrase total), format HTML MURNI.
    DI AKHIR: Berikan daftar sumber referensi dengan link aktif.
    RESPON: Hanya isi artikel saja dalam format HTML.`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${JARVIS_CONFIG.apiKey}` },
            body: JSON.stringify({
                model: JARVIS_CONFIG.model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const hasil = data.choices[0].message.content;
        
        displayArea.value = hasil;
        alert("Selesai! Hasil otomatis di-copy ke clipboard.");
        navigator.clipboard.writeText(hasil);
        
    } catch (e) {
        alert("Gagal memanggil AI: " + e.message);
    } finally {
        btn.innerText = "⚡ GENERATE SEKARANG";
        btn.disabled = false;
    }
}

// Munculkan UI secara otomatis
(function initUI() {
    const div = document.createElement('div');
    div.id = "ai-admin-panel";
    div.innerHTML = `
        <div style="position:fixed; bottom:20px; right:20px; z-index:9999; background:#001529; color:#fff; padding:20px; border-radius:10px; width:300px; box-shadow:0 10px 30px rgba(0,0,0,0.5); font-family:sans-serif; border:1px solid #00d4ff;">
            <h4 style="margin:0 0 10px 0; color:#00d4ff;">J.A.R.V.I.S News Generator</h4>
            <input id="ai-judul-input" placeholder="Masukkan Judul/Topik..." style="width:100%; padding:8px; margin-bottom:10px; border-radius:4px; border:none;">
            <textarea id="ai-content-output" placeholder="Hasil HTML akan muncul di sini..." style="width:100%; height:100px; margin-bottom:10px; font-size:10px; background:#000; color:#0f0; border:none;"></textarea>
            <button id="btn-ai-exec" onclick="generateAIArticle()" style="width:100%; padding:10px; background:#00d4ff; border:none; color:#000; font-weight:bold; cursor:pointer; border-radius:4px;">⚡ GENERATE SEKARANG</button>
            <p style="font-size:9px; margin-top:10px; opacity:0.6;">Source: MSN Indonesia | Data Real-time</p>
        </div>
    `;
    document.body.appendChild(div);
})();
