/* ═══════════════════════════════════════════════════════════════
   kalendar-svatky.js — Jouza Radio & News
   Český jmenný kalendář (jmeniny / svátky)
   ───────────────────────────────────────────────────────────────
   Zdroj dat: kalendar365.cz (ověřeno 16. 7. 2026), cross-check
   proti svatky.centrum.cz a jmenasvatky.cz pro sporné dny.
   Nahrazuje předchozí verzi, která byla sestavena z paměti a
   obsahovala 18+ potvrzených chyb (viz audit 16. 7. 2026).

   Globální proměnné: SVATKY_DATA, getSvatek()
   Index 0 = 1. den měsíce | pole[0] = leden ... pole[11] = prosinec
   '—' = den bez oficiálních jmenin (státní svátek / bez jména)
   Únor: index 28 = 29. 2., jmeniny "Horymír" (jen v přestupném roce)
   ═══════════════════════════════════════════════════════════════ */

const SVATKY_DATA = [
  // Leden (31)
  ['—','Karina','Radmila','Diana','Dalimil','—','Vilma','Čestmír','Vladan','Břetislav','Bohdana','Pravoslav','Edita','Radovan','Alice','Ctirad','Drahoslav','Vladislav','Doubravka','Ilona','Běla','Slavomír','Zdeněk','Milena','Miloš','Zora','Ingrid','Otýlie','Zdislava','Robin','Marika'],
  // Únor (28 + přestupný den 29 = Horymír)
  ['Hynek','Nela','Blažej','Jarmila','Dobromila','Vanda','Veronika','Milada','Apolena','Mojmír','Božena','Slavěna','Věnceslav','Valentýn','Jiřina','Ljuba','Miloslava','Gizela','Patrik','Oldřich','Lenka','Petr','Svatopluk','Matěj','Liliana','Dorota','Alexandr','Lumír','Horymír'],
  // Březen (31)
  ['Bedřich','Anežka','Kamil','Stela','Kazimír','Miroslav','Tomáš','Gabriela','Františka','Viktorie','Anděla','Řehoř','Růžena','Rút','Ida','Elena','Vlastimil','Eduard','Josef','Světlana','Radek','Leona','Ivona','Gabriel','Marián','Emanuel','Dita','Soňa','Taťána','Arnošt','Kvido'],
  // Duben (30)
  ['Hugo','Erika','Richard','Ivana','Miroslava','Vendula','Heřman','Ema','Dušan','Darja','Izabela','Julius','Aleš','Vincenc','Anastázie','Irena','Rudolf','Valérie','Rostislav','Marcela','Alexandra','Evženie','Vojtěch','Jiří','Marek','Oto','Jaroslav','Vlastislav','Robert','Blahoslav'],
  // Květen (31)
  ['—','Zikmund','Alexej','Květoslav','Klaudie','Radoslav','Stanislav','—','Ctibor','Blažena','Svatava','Pankrác','Servác','Bonifác','Žofie','Přemysl','Aneta','Nataša','Ivo','Zbyšek','Monika','Emil','Vladimír','Jana','Viola','Filip','Valdemar','Vilém','Maxmilián','Ferdinand','Kamila'],
  // Červen (30)
  ['Laura','Jarmil','Tamara','Dalibor','Dobroslav','Norbert','Iveta','Medard','Stanislava','Gita','Bruno','Antonie','Antonín','Roland','Vít','Zbyněk','Adolf','Milan','Leoš','Květa','Alois','Pavla','Zdeňka','Jan','Ivan','Adriana','Ladislav','Lubomír','Petr a Pavel','Šárka'],
  // Červenec (31)
  ['Jaroslava','Patricie','Radomír','Prokop','Cyril a Metoděj','—','Bohuslava','Nora','Berenika','Libuše','Olga','Bořek','Markéta','Karolína','Jindřich','Luboš','Martina','Drahomíra','Čeněk','Ilja','Vítězslav','Magdaléna','Libor','Kristýna','Jakub','Anna','Věroslav','Viktor','Marta','Bořivoj','Ignác'],
  // Srpen (31)
  ['Oskar','Gustav','Miluše','Dominik','Kristián','Oldřiška','Lada','Soběslav','Roman','Vavřinec','Zuzana','Klára','Alena','Alan','Hana','Jáchym','Petra','Helena','Ludvík','Bernard','Johana','Bohuslav','Sandra','Bartoloměj','Radim','Luděk','Otakar','Augustýn','Evelína','Vladěna','Pavlína'],
  // Září (30)
  ['Linda','Adéla','Bronislav','Jindřiška','Boris','Boleslav','Regína','Mariana','Daniela','Irma','Denisa','Marie','Lubor','Radka','Jolana','Ludmila','Naděžda','Kryštof','Zita','Oleg','Matouš','Darina','Berta','Jaromír','Zlata','Andrea','Jonáš','Václav','Michal','Jeroným'],
  // Říjen (31)
  ['Igor','Oliver','Bohumil','František','Eliška','Hanuš','Justýna','Věra','Štefan','Marina','Andrej','Marcel','Renáta','Agáta','Tereza','Havel','Hedvika','Lukáš','Michaela','Vendelín','Brigita','Sabina','Teodor','Nina','Beáta','Erik','Šarlota','Jidáš','Silvie','Tadeáš','Štěpánka'],
  // Listopad (30)
  ['Felix','—','Hubert','Karel','Miriam','Liběna','Saskie','Bohumír','Bohdan','Evžen','Martin','Benedikt','Tibor','Sáva','Leopold','Otmar','Mahulena','Romana','Alžběta','Nikola','Albert','Cecílie','Klement','Emílie','Kateřina','Artur','Xenie','René','Zina','Ondřej'],
  // Prosinec (31)
  ['Iva','Blanka','Svatoslav','Barbora','Jitka','Mikuláš','Benjamín','Květoslava','Vratislav','Julie','Dana','Simona','Lucie','Lýdie','Radana','Albína','Daniel','Miloslav','Ester','Dagmar','Natálie','Šimon','Vlasta','Adam a Eva','—','Štěpán','Žaneta','Bohumila','Judita','David','Silvestr']
];

function getSvatek(d) {
  const m = (d || new Date()).getMonth();   // 0–11
  const day = (d || new Date()).getDate();  // 1–31
  return (SVATKY_DATA[m] && SVATKY_DATA[m][day - 1]) || '—';
}
