const fs = require('fs');

// Tajné adresy z GitHub Secrets
const GAS_URL = process.env.GAS_URL;
const NBSENSE_URL = process.env.NBSENSE_URL;

// Node/undici výchozí UA řada webů buď blokuje, nebo jim servíruje jiný
// (prázdný/HTML) obsah než prohlížeči. Tváříme se jako běžný desktop Chrome.
const FEED_FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
};
const FEED_FETCH_TIMEOUT_MS = 15000;

function looksLikeFeed(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return true; // interní JSON feedy (např. NBSense)
  const head = trimmed.slice(0, 500).toLowerCase();
  return head.includes('<rss') || head.includes('<feed') || head.includes('<?xml');
}

function countFeedItems(text) {
  const matches = text.match(/<item[\s>]|<entry[\s>]/gi);
  return matches ? matches.length : 0;
}

// Ořízne RSS/Atom/RDF na prvních `limit` položek. data.json se commituje každých
// 30 min, takže ukládání celých feedů zbytečně nafukuje data.json i historii repa.
// Frontend stejně nikdy nezobrazí víc než `limit` položek na zdroj.
function trimFeed(text, limit) {
  const n = parseInt(limit, 10);
  if (!n || n < 1) return text;
  const re = /<(?:item|entry)[\s>]/gi;
  let m, count = 0, cut = -1;
  while ((m = re.exec(text)) !== null) {
    count++;
    if (count === n + 1) { cut = m.index; break; }
  }
  if (cut === -1) return text; // feed má <= limit položek, nechat beze změny
  const head = text.slice(0, cut);
  if (/<rdf:RDF[\s>]/i.test(head)) return head + '</rdf:RDF>';
  if (/<feed[\s>]/i.test(head)) return head + '</feed>';
  return head + '</channel></rss>';
}

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
        const feedRes = await fetch(feed.url, {
          headers: FEED_FETCH_HEADERS,
          signal: AbortSignal.timeout(FEED_FETCH_TIMEOUT_MS)
        });
        if (!feedRes.ok) {
          console.warn(`  ⚠️  ${feed.label}: HTTP ${feedRes.status} ${feedRes.statusText}`);
        }
        const text = await feedRes.text();
        const isJson = text.trim().startsWith('{') || text.trim().startsWith('[');
        let feedOk = true;
        if (!looksLikeFeed(text)) {
          console.warn(`  ⚠️  ${feed.label}: odpověď nevypadá jako RSS/Atom/JSON (možný bot-block nebo špatná URL) — obsah neukládám, zkontroluj ${feed.url}`);
          feedOk = false;
        } else if (!isJson && countFeedItems(text) === 0) {
          console.warn(`  ⚠️  ${feed.label}: feed je validní XML, ale obsahuje 0 položek (možný rate-limit/bot-block s prázdnou odpovědí) — zkontroluj ${feed.url}`);
          feedOk = false;
        }
        // Nefunkční feed → prázdný rawText; frontend takový zdroj přeskočí (0 položek).
        // Funkční XML feed se ořízne na limit; JSON (NBSense) zůstává celý.
        const rawText = !feedOk ? '' : (isJson ? text : trimFeed(text, feed.limit || 10));
        compiledNews.push({ label: feed.label, limit: feed.limit, subTab: feed.subTab, rawText });

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
