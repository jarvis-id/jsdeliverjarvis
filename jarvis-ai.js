/* 
   JARVIS AI REMOTE WIDGET 
   Source: MSN Indonesia | Function: Auto-Portal to Blogger Editor
*/

async function startJarvisPortal() {
    const apiKey = "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";
    const keyword = document.getElementById('jarvis-portal-input').value;
    const btn = document.getElementById('jarvis-portal-btn');
    const blogId = "2993587733256297709"; // ID Blog Anda dari URL Dashboard

    if(!keyword) return alert("Masukkan Judul Berita!");

    btn.innerText = "⏳ SCANNING MSN...";
    btn.disabled = true;

    try {
        // 1. CARI BERITA MSN
        const rssUrl = `https://news.google.com/rss/search?q=site:msn.com/id-id ${encodeURIComponent(keyword)}&hl=id&gl=ID&ceid=ID:id`;
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const resNews = await fetch(proxyUrl);
        const dataNews = await resNews.json();
        const facts = dataNews.items ? dataNews.items.slice(0,3).map(i => i.title).join(". ") : "";

        btn.innerText = "✍️ AI WRITING...";

        // 2. PANGGIL AI
        const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`},
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: `Tulis berita HTML unik (anti-plagiat) berdasarkan: ${facts}. Judul: ${keyword}. Minimal 500 kata.`}]
            })
        });

        const aiData = await aiRes.json();
        const contentHtml = aiData.choices[0].message.content;

        // 3. COPY KE CLIPBOARD & BUKA EDITOR
        await navigator.clipboard.writeText(contentHtml);
        
        alert("✅ ARTIKEL SELESAI!\n\nHasil sudah di-copy. J.A.R.V.I.S akan membuka Editor Blogger. Silakan PASTE di tampilan HTML.");
        
        // Buka Tab Baru Langsung ke Postingan Baru
        window.open(`https://www.blogger.com/blog/post/new/${blogId}`, '_blank');

    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        btn.innerText = "⚡ GENERATE & POST";
        btn.disabled = false;
    }
}
