const fs = require('fs');

// URL si GitHub přečte ze svých tajných Secrets
const GAS_URL = process.env.GAS_URL; 

// --- POMOCNÁ FUNKCE ---
function decodeB64Float(b64) {
    const raw = Buffer.from(b64, 'base64');
    const float64Array = new Float64Array(raw.buffer, raw.byteOffset, raw.length / 8);
    return Array.from(float64Array);
}

// --- HLAVNÍ FUNKCE ---
async function fetchDendroGraph(stationId) {
    const pageUrl = `https://dendronet.cz/location/${stationId}`;
    const apiUrl = 'https://dendronet.cz/_dash-update-component';

    try {
        console.log(`[${stationId}] Fáze 1: Získávám Cookies...`);
        const pageRes = await fetch(pageUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
        });
        
        let cookieHeader = '';
        const rawCookies = pageRes.headers.get('set-cookie');
        if (rawCookies) cookieHeader = rawCookies.split(',').map(c => c.split(';')[0]).join('; ');

        console.log(`[${stationId}] Fáze 2: Tahám tlustá data přes Pages Content...`);
        
        // Vracíme se k payloadu, který prokazatelně neházel chybu 500
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
            "changedPropIds": ["_pages_location.pathname", "_pages_location.search"]
        };

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                'Origin': 'https://dendronet.cz',
                'Referer': pageUrl,
                'Cookie': cookieHeader
            },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error(`HTTP chyba ${res.status}`);
        
        const json = await res.json();
        
        // AGRESIVNÍ HLEDAČ: Prohrabe strukturu matrjošky až na úplné dno
        let traces = null;
        function searchForData(node) {
            if (traces) return;
            if (!node || typeof node !== 'object') return;

            if (Array.isArray(node)) {
                if (node.length > 0 && node[0] && typeof node[0] === 'object' && 'name' in node[0]) {
                    if (node.some(t => t.name && (t.name.includes('Temperature') || t.name.includes('Teplota')))) {
                        traces = node;
                        return;
                    }
                }
                for (let item of node) searchForData(item);
            } else {
                if (node.data && Array.isArray(node.data)) {
                     if (node.data.some(t => t.name && (t.name.includes('Temperature') || t.name.includes('Teplota')))) {
                        traces = node.data;
                        return;
                    }
                }
                for (let key in node) searchForData(node[key]);
            }
        }
        
        // Spustíme hledače
        searchForData(json);
        
        if (!traces) {
            throw new Error(`Graf sice dorazil, ale nenalezli jsme ho ve struktuře.`);
        }

        let times = [], temp = [], soil = [];

        traces.forEach(t => {
            if (!t.name || !t.y) return;
            
            let vals = [];
            if (t.y.bdata) {
                vals = decodeB64Float(t.y.bdata).map(v => isNaN(v) ? null : v);
            } else if (Array.isArray(t.y)) {
                vals = t.y.map(v => v === null ? null : Number(v));
            }

            if (t.x && Array.isArray(t.x) && times.length === 0) {
                times = t.x.map(x => String(x).substring(5, 16).replace('T', ' '));
            }
            
            if (t.name.includes("Air Temperature") || t.name.includes("Teplota")) temp = vals;
            if (t.name.includes("SWC CS616") || t.name.includes("půdní vlhkost") || t.name.includes("soil moisture")) {
                soil = vals.map(v => v !== null ? Number((v * 100).toFixed(2)) : null);
            }
        });

        return { times, temp, soil };
    } catch (e) {
        console.error(`[${stationId}] KRACH:`, e.message);
        return { chyba: e.message, times: [], temp: [], soil: [] };
    }
}

// --- HLAVNÍ BUILD PROCES ---
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
        compiledNews.push({ label: feed.label, limit: feed.limit, rawText: text });
      } catch (e) {
        console.error(`Chyba při stahování feedu ${feed.label}:`, e.message);
      }
    }
    
    console.log("Jdu do lesa tahat data o přírodě...");
    const natureData = {
        jetrichovice: await fetchDendroGraph('CZ_212_NS_Jetrichovice'),
        ralsko: await fetchDendroGraph('CZ_057_BE_Ralsko')
    };
    
    const finalData = {
      radio: appData.radio.filter(r => r.isPublic !== false),
      news: compiledNews,
      nature: natureData
    };
    
    fs.writeFileSync('data.json', JSON.stringify(finalData));
    console.log("data.json úspěšně vygenerován i s lesními senzory!");

  } catch (err) {
    console.error("Kritická chyba buildu:", err);
    process.exit(1);
  }
}

build();
