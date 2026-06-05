/* ═══════════════════════════════════════════════════════════════
   kalendar-svatky.js — Jouza Radio & News
   Český jmenný kalendář (jmeniny / svátky)
   ───────────────────────────────────────────────────────────────
   Globální proměnné: SVATKY_DATA, getSvatek()
   Index 0 = 1. den měsíce | pole[0] = leden ... pole[11] = prosinec
   Únor: index 28 = přestupný den (29. 2.), jinak '—'
   ═══════════════════════════════════════════════════════════════ */

const SVATKY_DATA = [
  // Leden (31)
  ['Nový rok','Karina','Radmila','Diana','Dalibor','Kašpar','Vilma','Čestmír','Vladan','Břetislav','Bohdana','Pravoslav','Edita','Radovan','Alice','Ctirad','Drahoslav','Vladislav','Doubravka','Ilona','Běla','Slavomír','Zdeněk','Milena','Miloš','Zora','Ingrid','Otýlie','Zdislava','Robin','Marika'],
  // Únor (28 + přestupný)
  ['Hynek','Nela','Blažej','Jarmila','Dobromila','Vanda','Veronika','Milada','Apolena','Mojmír','Dezider','Slavěna','Věnceslava','Valentýn','Jiřina','Ljuba','Miloslava','Gizela','Patrik','Oldřich','Lenka','Isabela','Svatopluk','Matěj','Liliana','Dorota','Alexandr','Lumír','—'],
  // Březen (31)
  ['Bedřich','Anežka','Kamil','Stela','Irena','Miroslav','Tomáš','Gabriela','Františka','Viktorie','Anděla','Řehoř','Růžena','Rút','Ida','Elena','Vlastimil','Eduard','Josef','Světlana','Radek','Leona','Ivona','Gabriel','Marián','Emanuel','Dita','Soňa','Taťána','Arnošt','Kvído'],
  // Duben (30)
  ['Hugo','Erika','Richard','Ivana','Miroslava','Vendula','Heřman','Ema','Dušan','Dáša','Izabela','Julius','Aleš','Vincenc','Anastázie','Irena','Rudolf','Valérie','Rostislav','Marcela','Alexandra','Evžénie','Vojtěch','Jiří','Marek','Oto','Jaroslav','Vlastislav','Robert','Blahoslav'],
  // Květen (31)
  ['Svátek práce','Zikmund','Alexej','Kvítko','Klaudie','Radovan','Stanislav','Stanislava','Ctibor','Blahoslav','Celestýn','Pankrác','Servác','Bonifác','Žofie','Přemysl','Aneta','Nataša','Ivo','Zbyněk','Monika','Jana','Vladimír','Jana','Viola','Filip','Valdemar','Vilém','Maxmilián','Ferdinand','Petronela'],
  // Červen (30)
  ['Laura','Jarmil','Tamara','Dalimil','Dobroslav','Norbert','Iveta','Medard','Stanislava','Gita','Bruno','Antonie','Antonín','Roland','Vít','Zbyněk','Adolf','Milan','Leoš','Květa','Alois','Pavla','Zdeňka','Jan','Ivan','Adriana','Ladislav','Lubomír','Petr','Pavel'],
  // Červenec (31)
  ['Jaroslava','Patricie','Radomír','Prokop','Cyril a Metoděj','Benedikta','Bohuslava','Nora','Dobroslava','Libuše','Olga','Bořek','Markéta','Karolína','Jindřich','Oldřich','Martina','Drahomíra','Čeněk','Ilja','Vítězslav','Magdaléna','Libor','Kristýna','Jakub','Anna','Věroslav','Viktor','Marta','Zlatuše','Ignác'],
  // Srpen (31)
  ['Oskar','Gustav','Miluše','Dominika','Kristián','Oldřiška','Lada','Soběslav','Roman','Vavřinec','Zuzana','Klára','Alžběta','Alan','Hana','Jáchym','Petra','Helena','Ludvík','Bernard','Johana','Bohuslav','Hynek','Bartoloměj','Radim','Luděk','Monique','Augustýn','Evelína','Félix','Pavlína'],
  // Září (30)
  ['Linda','Adéla','Bronislav','Jindřiška','Boris','Boleslav','Regína','Mariana','Daniela','Irma','Denisa','Marie','Lubor','Radka','Jolana','Ludmila','Naděžda','Kryštof','Zita','Oleg','Matouš','Darina','Bořivoj','Jaromír','Zlata','Nikola','Jonáš','Václav','Michal','Jeroným'],
  // Říjen (31)
  ['Igor','Oliver','Bohumil','František','Eliška','Hanuš','Justýna','Věra','Štefan','Marina','Andělka','Marcel','Renáta','Agáta','Tereza','Hedvika','Hedvika','Lukáš','Michaela','Vendelín','Brigita','Sabina','Teodor','Radovan','Beáta','Erik','Šarlota','Zbyšek','Silvie','Terezie','Štěpánka'],
  // Listopad (30)
  ['Felix','Památka zesnulých','Hubert','Karel','Miriam','Liběna','Saskie','Bohumír','Bohdan','Evžen','Martin','Radovan','Tibor','Sáva','Leopold','Otmar','Mahulena','Romana','Alžběta','Zita','Albert','Cecílie','Klement','Jana','Kateřina','Artur','Xenie','René','Zina','Ondřej'],
  // Prosinec (31)
  ['Iva','Blanka','Svatoslav','Barbora','Jitka','Mikuláš','Ambrož','Blahoslav','Daniela','Julie','Dana','Simona','Lucie','Lýdie','Radana','Albína','Daniel','Miloslav','Ester','Dagmar','Tomáš','Šimon','Vlasta','Adam a Eva','Štěpán','Štěpán','Žaneta','Bohumila','Judita','David','Silvestr']
];

/**
 * Vrátí jméno svátku pro dané datum.
 * @param {Date} [d] — datum, výchozí je dnes
 * @returns {string} jméno nebo '—'
 */
function getSvatek(d) {
  const date = d || new Date();
  const m    = date.getMonth();   // 0–11
  const day  = date.getDate();    // 1–31
  return (SVATKY_DATA[m] && SVATKY_DATA[m][day - 1]) || '—';
}
