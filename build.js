const fs = require('fs');

// URL si GitHub přečte ze svých tajných Secrets
const GAS_URL = process.env.GAS_URL; 

async function build() {
  try {
    console.log("Stahuji nastavení z motoru...");
    const res = await fetch(GAS_URL);
    const appData = await res.json();
    
    if (appData.error) throw new Error(appData.error);

    const compiledNews = [];
    
    // Zprávy
    for (const feed of appData.news) {
      if (feed.isPublic === false) continue;
      try {
        console.log(`Stahuji feed: ${feed.label}`);
        const feedRes = await fetch(feed.url);
        const text = await feedRes.text();
        compiledNews.push({ label: feed.label, limit: feed.limit, rawText: text });
      } catch (e) {
        console.error(`Chyba při stahování feedu ${feed.label}:`, e.message);
      }
    }
    
    // Čistý export (jen rádio a zprávy)
    const finalData = {
      radio: appData.radio.filter(r => r.isPublic !== false),
      news: compiledNews
    };
    
    fs.writeFileSync('data.json', JSON.stringify(finalData));
    console.log("data.json úspěšně vygenerován! (čistá verze bez lesů)");

  } catch (err) {
    console.error("Kritická chyba buildu:", err);
    process.exit(1);
  }
}

build();
