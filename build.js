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
    
    // Projdeme všechny zprávy a STÁHNEME je přímo v tomto skriptu
    for (const feed of appData.news) {
      if (feed.isPublic === false) continue;
      
      try {
        console.log(`Stahuji feed: ${feed.label} (${feed.url})`);
        // Obejmutí CORS limitů – Node.js nemá CORS, takže stáhne cokoliv odkudkoliv
        const feedRes = await fetch(feed.url);
        const text = await feedRes.text();
        
        compiledNews.push({
          label: feed.label,
          limit: feed.limit,
          rawText: text // Ukládáme surový text (XML/JSON)
        });
      } catch (e) {
        console.error(`Chyba při stahování feedu ${feed.label}:`, e.message);
      }
    }
    
    const finalData = {
      // Rovnou odfiltrujeme vypnutá rádia
      radio: appData.radio.filter(r => r.isPublic !== false),
      news: compiledNews
    };
    
    // Uložíme zkompilovaná data do statického souboru
    fs.writeFileSync('data.json', JSON.stringify(finalData));
    console.log("data.json úspěšně vygenerován!");

  } catch (err) {
    console.error("Kritická chyba buildu:", err);
    process.exit(1); // Zastaví GitHub Action, pokud něco selže
  }
}

build();
