const fs = require('fs');

// URL si GitHub přečte ze svých tajných Secrets
const GAS_URL = process.env.GAS_URL; 


// --- NOVÉ: Pomocné funkce pro DendroNet ---

// 1. Dekódovací funkce (tahle nám tam teď chyběla!)
function decodeB64Float(b64) {
    const raw = Buffer.from(b64, 'base64');
    const float64Array = new Float64Array(raw.buffer, raw.byteOffset, raw.length / 8);
    return Array.from(float64Array);
}

async function fetchDendroGraph(stationId) {
    const url = 'https://dendronet.cz/_dash-update-component';
    
    const payload = {
        "output": ".._pages_content.children..._pages_store.data..",
        "outputs": [
            { "id": "_pages_content", "property": "children" },
            { "id": "_pages_store", "property": "data" }
        ],
        "inputs": [
            { "id": "_pages_location", "property": "pathname", "value": `/location/${stationId}` },
            { "id": "_pages_location", "property": "search", "value": "" },
            { "id": "lang-store", "property": "data", "value": "cz" }
        ],
        "changedPropIds": [
            "_pages_location.pathname",
            "_pages_location.search"
        ]
    };

    try {
        console.log(`Stahuji les z DendroNetu: ${stationId}`);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://dendronet.cz',
                'Referer': `https://dendronet.cz/location/${stationId}`
            },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP chyba ${res.status}: ${errText.substring(0, 100)}`);
        }
        
        const json = await res.json();
        
        let traces = null;
        function findTraces(obj) {
            if (!obj || typeof obj !== 'object') return;
            if (traces) return;
            
            if (Array.isArray(obj)) {
                for (let item of obj) findTraces(item);
            } else {
                if (obj.data && Array.isArray(obj.data) && obj.data.some(t => t.y && t.y.bdata)) {
                    traces = obj.data;
                    return;
                }
                for (let key in obj) findTraces(obj[key]);
            }
        }

        findTraces(json);
        
        if (!traces) {
            throw new Error("Graf nebyl v odpovědi nalezen.");
        }

        let times = [];
        let temp = [];
        let soil = [];

        traces.forEach(t => {
            if (!t.name || !t.y || !t.y.bdata) return;
            
            const vals = decodeB64Float(t.y.bdata).map(v => isNaN(v) ? null : v);

            // OPRAVA: Bezpečné vytažení časů z jakékoliv stopy, která je zrovna má
            if (t.x && Array.isArray(t.x) && times.length === 0) {
                times = t.x.map(x => String(x).substring(5, 16).replace('T', ' '));
            }

            if (t.name.includes("Air Temperature")) {
                temp = vals;
            }
            if (t.name.includes("SWC CS616")) {
                soil = vals.map(v => v !== null ? Number((v * 100).toFixed(2)) : null);
            }
        });

        return { times, temp, soil };
    } catch (e) {
        console.error(`❌ Chyba stahování DendroNetu u ${stationId}:`, e.message);
        return null; 
    }
}
// --- KONEC NOVÝCH FUNKCÍ ---


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
        const feedRes = await fetch(feed.url);
        const text = await feedRes.text();
        
        compiledNews.push({
          label: feed.label,
          limit: feed.limit,
          rawText: text 
        });
      } catch (e) {
        console.error(`Chyba při stahování feedu ${feed.label}:`, e.message);
      }
    }
    
    // --- NOVÉ: Stáhneme živá data z lesů ---
    console.log("Jdu do lesa tahat data o přírodě...");
    const natureData = {
        jetrichovice: await fetchDendroGraph('CZ_212_NS_Jetrichovice'),
        ralsko: await fetchDendroGraph('CZ_057_BE_Ralsko')
    };
    
    const finalData = {
      radio: appData.radio.filter(r => r.isPublic !== false),
      news: compiledNews,
      nature: natureData // Přibalíme lesy k rádiu a zprávám!
    };
    
    // Uložíme zkompilovaná data do statického souboru
    fs.writeFileSync('data.json', JSON.stringify(finalData));
    console.log("data.json úspěšně vygenerován i s lesními senzory!");

  } catch (err) {
    console.error("Kritická chyba buildu:", err);
    process.exit(1);
  }
}

build();
