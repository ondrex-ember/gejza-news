// ==========================================
// Jouza Radio & News — Consent Mode v2 banner (GDPR, advanced)
// ==========================================
// newsandradio.cz — analogická implementace k ember-pa.cz/consent.js.
// Použití: <script src="/consent.js"></script> na konci <body>, po ostatních scriptech.
//
// Vyžaduje, aby <head> obsahoval Consent Mode v2 default snippet
// (gtag('consent','default',...)) PŘED GTM a funkci jouzaLoadClarity()
// místo přímého vložení Clarity tagu — viz index.html.
// Vizuál používá site témata přes CSS proměnné (--bg/--card/--border/--text/--muted/--act),
// takže banner respektuje aktuálně zvolené téma (dark/white/blue/red).
// Klíč: jouza_consent ("granted" | "denied")
// ==========================================
(function(){
  var KEY = 'jouza_consent';

  function curLang(){
    try{
      var l = (document.documentElement.getAttribute('lang') || 'cs').toLowerCase();
      return l.indexOf('en') === 0 ? 'en' : 'cs';
    }catch(e){ return 'cs'; }
  }

  var CSS = `
#joz-consent-bar{position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));
  transform:translateX(-50%);width:calc(100% - 20px);max-width:640px;z-index:99998;display:none;
  background:var(--card);color:var(--text);
  border:1px solid var(--border);border-radius:14px;
  box-shadow:0 20px 60px rgba(0,0,0,.5);
  font-family:inherit;padding:18px 20px;text-align:left;}
#joz-consent-bar.joz-on{display:block;animation:jozIn .35s ease;}
@keyframes jozIn{from{opacity:0;transform:translate(-50%,16px);}to{opacity:1;transform:translate(-50%,0);}}
.joz-inner{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.joz-text{flex:1 1 320px;font-size:13px;line-height:1.6;color:var(--muted);}
.joz-title{display:block;font-size:11px;text-transform:uppercase;
  letter-spacing:1.5px;color:var(--act);font-weight:700;margin-bottom:6px;}
.joz-text a,.joz-box a{color:var(--act);font-weight:600;text-decoration:underline;cursor:pointer;}
.joz-actions{display:flex;gap:8px;flex:0 0 auto;}
.joz-btn{min-width:112px;padding:10px 16px;border-radius:8px;border:1px solid var(--border);
  background:var(--bg);color:var(--text);font-family:inherit;font-size:13px;
  font-weight:600;cursor:pointer;transition:background .2s,border-color .2s;}
.joz-btn:hover{border-color:var(--act);}
.joz-btn.joz-accept{background:var(--act);color:var(--bg);border-color:var(--act);font-weight:700;}
.joz-btn.joz-accept:hover{filter:brightness(1.08);}
@media (max-width:560px){.joz-actions{flex:1 1 100%;}.joz-btn{flex:1;min-width:0;}}
#joz-consent-modal{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.65);display:none;
  align-items:center;justify-content:center;padding:18px;}
#joz-consent-modal.joz-on{display:flex;}
.joz-box{background:var(--card);color:var(--text);
  border:1px solid var(--border);border-radius:14px;max-width:480px;width:100%;
  max-height:82vh;overflow:auto;padding:24px;text-align:left;
  font-family:inherit;box-shadow:0 20px 60px rgba(0,0,0,.5);}
.joz-box h3{font-size:15px;letter-spacing:.3px;margin:0 0 16px;color:var(--act);}
.joz-box p{font-size:13px;line-height:1.65;margin:0 0 10px;color:var(--muted);}
.joz-status{font-size:12px;color:var(--muted);font-style:italic;
  border-top:1px solid var(--border);padding-top:10px;margin-top:6px;}
.joz-status strong{color:var(--act);font-style:normal;}
.joz-box .joz-actions{margin-top:16px;justify-content:flex-end;flex-wrap:wrap;}
`;

  var TX = {
    cs: {
      title: `Měření návštěvnosti`,
      text: `newsandradio.cz používá Google Analytics, Google Tag Manager a Microsoft Clarity, abychom věděli, jak web funguje a kde má rezervy. Žádné reklamní cookies, žádná osobní data k prodeji.`,
      more: `Více info`,
      deny: `Odmítám`,
      accept: `Souhlasím`,
      close: `✕ Zavřít`,
      mTitle: `Soukromí a měření`,
      m1: `newsandradio.cz měří návštěvnost pomocí Google Analytics 4 (přes Google Tag Manager) a Microsoft Clarity (mapy chování a nahrávky relací). Zajímá nás jen to, jak se web používá — kolik lidí ho navštíví, které sekce jsou oblíbené a kde uživatelé narazí na potíže.`,
      m2: `Nepoužíváme reklamní cookies ani remarketing a žádná osobní data neprodáváme ani nesdílíme s dalšími stranami.`,
      m3: `Dokud souhlas nedáte, neukládají se žádné analytické cookies a Microsoft Clarity se vůbec nenačítá — Google dostává pouze anonymní signály bez cookies (Google Consent Mode v2).`,
      m4: `Volbu můžete kdykoli změnit odkazem 🍪 Soukromí v patičce stránky. Globální odhlášení: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">doplněk Google Analytics Opt-out</a>.`,
      m5: `Provozovatel: Ember, Ondřej Panuška, IČO 04351193 · <a href="https://ember-pa.cz/" target="_blank" rel="noopener">ember-pa.cz</a>`,
      st: `Aktuální volba`,
      sG: `souhlas udělen`,
      sD: `odmítnuto`,
      sN: `zatím nerozhodnuto`
    },
    en: {
      title: `Analytics`,
      text: `newsandradio.cz uses Google Analytics, Google Tag Manager and Microsoft Clarity to understand how the site performs and where it can improve. No advertising cookies, no personal data sold.`,
      more: `More info`,
      deny: `Decline`,
      accept: `Accept`,
      close: `✕ Close`,
      mTitle: `Privacy & analytics`,
      m1: `newsandradio.cz measures traffic with Google Analytics 4 (via Google Tag Manager) and Microsoft Clarity (behavior maps and session recordings). We only want to know how the site is used — how many people visit, which sections are popular, and where users run into trouble.`,
      m2: `We use no advertising cookies or remarketing, and no personal data is sold or shared with third parties.`,
      m3: `Until you consent, no analytics cookies are stored and Microsoft Clarity does not load at all — Google only receives anonymous cookieless signals (Google Consent Mode v2).`,
      m4: `You can change your choice at any time via the 🍪 Privacy link in the page footer. Global opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-out add-on</a>.`,
      m5: `Operator: Ember, Ondřej Panuška, Company ID (IČO) 04351193 · <a href="https://ember-pa.cz/" target="_blank" rel="noopener">ember-pa.cz</a>`,
      st: `Current choice`,
      sG: `accepted`,
      sD: `declined`,
      sN: `not decided yet`
    }
  };

  var bar = null, modal = null;

  function getSaved(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function decided(){ var s = getSaved(); return s === 'granted' || s === 'denied'; }
  function label(l){
    var t = TX[l === 'en' ? 'en' : 'cs'], s = getSaved();
    return s === 'granted' ? t.sG : (s === 'denied' ? t.sD : t.sN);
  }

  function clearAnalyticsCookies(){
    try{
      var host = location.hostname, parts = host.split('.'),
          root = parts.length > 1 ? '.' + parts.slice(-2).join('.') : host;
      var prefixes = ['_ga', '_gid', '_gat', '_clck', '_clsk', 'CLID', 'ANONCHK', 'MUID', 'SM', 'MR'];
      document.cookie.split(';').forEach(function(c){
        var n = c.split('=')[0].trim();
        for(var i = 0; i < prefixes.length; i++){
          if(n.indexOf(prefixes[i]) === 0){
            var exp = '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            document.cookie = n + exp;
            document.cookie = n + exp + ';domain=' + host;
            document.cookie = n + exp + ';domain=' + root;
            break;
          }
        }
      });
    }catch(e){}
  }

  function pushConsent(granted){
    window.dataLayer = window.dataLayer || [];
    if(typeof gtag === 'function'){
      gtag('consent', 'update', {
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
        analytics_storage: granted ? 'granted' : 'denied',
        functionality_storage: granted ? 'granted' : 'denied'
      });
    }
    window.dataLayer.push({ event: 'consent_update', consent_analytics: granted ? 'granted' : 'denied' });
    if(granted && typeof jouzaLoadClarity === 'function'){ jouzaLoadClarity(); }
  }

  function injectCss(){
    if(document.getElementById('joz-consent-style')) return;
    var s = document.createElement('style');
    s.id = 'joz-consent-style'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function fillBar(){
    var t = TX[curLang()];
    bar.innerHTML = `<div class="joz-inner">
  <div class="joz-text"><span class="joz-title">${t.title}</span>${t.text} <a href="#" class="joz-more">${t.more}</a></div>
  <div class="joz-actions">
    <button type="button" class="joz-btn joz-deny">${t.deny}</button>
    <button type="button" class="joz-btn joz-accept">${t.accept}</button>
  </div>
</div>`;
    bar.querySelector('.joz-more').addEventListener('click', function(e){ e.preventDefault(); openModal(); });
    bar.querySelector('.joz-deny').addEventListener('click', function(){ setConsent(false); });
    bar.querySelector('.joz-accept').addEventListener('click', function(){ setConsent(true); });
  }

  function fillModal(){
    var t = TX[curLang()];
    modal.innerHTML = `<div class="joz-box" role="dialog" aria-modal="true">
  <h3>${t.mTitle}</h3>
  <p>${t.m1}</p><p>${t.m2}</p><p>${t.m3}</p><p>${t.m4}</p><p>${t.m5}</p>
  <div class="joz-status">${t.st}: <strong>${label(curLang())}</strong></div>
  <div class="joz-actions">
    <button type="button" class="joz-btn joz-close">${t.close}</button>
    <button type="button" class="joz-btn joz-deny">${t.deny}</button>
    <button type="button" class="joz-btn joz-accept">${t.accept}</button>
  </div>
</div>`;
    modal.querySelector('.joz-close').addEventListener('click', closeModal);
    modal.querySelector('.joz-deny').addEventListener('click', function(){ setConsent(false); });
    modal.querySelector('.joz-accept').addEventListener('click', function(){ setConsent(true); });
  }

  function openBar(){
    injectCss();
    if(!bar){
      bar = document.createElement('div'); bar.id = 'joz-consent-bar'; bar.setAttribute('role', 'region');
      document.body.appendChild(bar);
    }
    fillBar();
    bar.classList.add('joz-on');
  }
  function closeBar(){ if(bar){ bar.classList.remove('joz-on'); } }

  function openModal(){
    injectCss();
    if(!modal){
      modal = document.createElement('div'); modal.id = 'joz-consent-modal';
      modal.addEventListener('click', function(e){ if(e.target === modal){ closeModal(); } });
      document.body.appendChild(modal);
    }
    fillModal();
    modal.classList.add('joz-on');
  }
  function closeModal(){ if(modal){ modal.classList.remove('joz-on'); } }

  function setConsent(granted){
    try{ localStorage.setItem(KEY, granted ? 'granted' : 'denied'); }catch(e){}
    pushConsent(granted);
    if(!granted){ clearAnalyticsCookies(); }
    closeBar(); closeModal();
  }

  window.jouzaConsentOpen = openBar;
  window.jouzaConsentInfo = openModal;
  window.jouzaConsentDecided = decided;
  window.jouzaConsentLabel = label;

  function init(){
    if(!decided()){ openBar(); }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
