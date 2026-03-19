const fs = require('fs');

// Tajné adresy z GitHub Secrets
const GAS_URL = process.env.GAS_URL; 
const NBSENSE_URL = process.env.NBSENSE_URL; 

async function build() {
  try {
    console.log("Stahuji nastavení z motoru...");
    const res = await fetch(GAS_URL);
    const appData = await res.json();
    
    if (appData.error) throw new Error(appData.error);

    const compiledNews = [];
    
    for (const feed of appData.news) {
      if (feed.isPublic === false) continue;
      try {
        console.log(`Stahuji feed: ${feed.label}`);
        const feedRes = await fetch(feed.url);
        const text = await feedRes.text();
	compiledNews.push({ label: feed.label, limit: feed.limit, 	subTab: feed.subTab, rawText: text });

      } catch (e) {
        console.error(`Chyba při stahování feedu ${feed.label}:`, e.message);
      }
    }
    
    // --- STAHUJEME PŘÍRODU Z TVÉHO NBSENSE ---
    console.log("Stahuji data o přírodě z NBSense (Google Apps Script)...");
    let natureData = { jetrichovice: null, ralsko: null };
    try {
        if (NBSENSE_URL) {
            const natureRes = await fetch(NBSENSE_URL);
            if (natureRes.ok) {
                natureData = await natureRes.json();
                console.log("Data z přírody úspěšně načtena!");
            } else {
                console.warn(`NBSense vrátil chybu: ${natureRes.status}`);
            }
        } else {
            console.warn("Chybí tajná adresa NBSENSE_URL v GitHub Secrets!");
        }
    } catch (e) {
        console.error("Nepodařilo se spojit s NBSense:", e.message);
    }
    
    const finalData = {
      radio: appData.radio.filter(r => r.isPublic !== false),
      news: compiledNews,
      nature: natureData
    };
    
    fs.writeFileSync('data.json', JSON.stringify(finalData));
    console.log("data.json úspěšně vygenerován i s daty z přírody!");

  } catch (err) {
    console.error("Kritická chyba buildu:", err);
    process.exit(1);
  }
}

build();
