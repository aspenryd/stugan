const items = {
  "dagbok": {
    "desc": "En sliten dagbok fylld med kryptiska marginalanteckningar och en grov karta över skogens utkant.",
    "portable": true,
    "story": "Dagboken tillhörde en av dina förfäder. Den talar om 'Skogens Hjärta', en plats med stor makt, och en 'smygande skugga' som hotar den. Den nämner också den uråldriga eken."
  },
  "rostig_lykta": {
    "desc": "En gammal, rostig fotogenlykta. Den saknar fotogen men glaset är helt.",
    "portable": true,
    "state": "Släckt", // Kan vara Tänd, Släckt, Tom
    "fuel": 0 // 0-100
  },
  "uråldrig_nyckel": {
    "desc": "En tung, rostig nyckel med ett intrikat mönster. Passar den till något i rotkällaren?",
    "portable": true
  },
  "glimmande_mossa_klump": {
    "desc": "En klump mossa som avger ett svagt, spöklikt grönt ljus. Tillräckligt för att lysa upp de närmaste stegen.",
    "portable": true,
    "state": "Lysande" // Kan vara Lysande, Falnad
  },
  "renande_kristall": {
    "desc": "En klar, pulserande kristall. Den sägs kunna rena orent vatten och motverka gifter.",
    "portable": true
  },
  "drivved": {
    "desc": "Några stadiga bitar drivved, tillräckligt stora för att bygga något flytande.",
    "portable": true // Kanske bara om man har rep? Eller så är de tunga.
  },
  "rep": { // Antag att detta är original-repet eller ett liknande nytt.
    "desc": "Ett starkt rep av tvinnad näver – luktar skog.",
    "portable": true,
    "state": "Löst" // Kan vara Löst, Fastbundet
  },
  "flotte": { // Kombinerat föremål
    "desc": "En enkel flotte byggd av drivved och rep. Den ser ut att hålla för en person.",
    "portable": false, // Stannar vid sjön
    "state": "Sjöduglig"
  },
  "runsten_del1": {
    "desc": "En bit av en runsten med en del av en symbol ingraverad.",
    "portable": true
  },
  "trälåda_låst": {
    "desc": "En liten, väderbiten trälåda med ett rostigt lås. Den är förvånansvärt tung.",
    "portable": false // Blir innehållet portabelt
  },
  "fotogen_flaska": { // Innehåll i trälådan
    "desc": "En nästan full flaska med fotogen. Perfekt för lyktan.",
    "portable": true
  },
  "sömnsvamp": {
    "desc": "En mjuk, lila svamp som avger en sötaktig doft. Den ser ut att kunna få vem som helst att somna.",
    "portable": true
  },
  "stärkande_svamp": {
    "desc": "En röd, fast svamp. Den sägs ge tillfällig styrka och uthållighet.",
    "portable": true
  },
  "runsten_del2": {
    "desc": "Ytterligare en bit av en runsten. Symbolen börjar ta form.",
    "portable": true
  },
  "örn_fjäder": {
    "desc": "En stor, vacker fjäder från en örn. Den känns lätt och stark.",
    "portable": true
  },
  "stjärnlins_bit1": {
    "desc": "En slipad bit kristallglas, troligen en del av en större lins.",
    "portable": true
  },
  "stjärnlins_bit2": {
    "desc": "Ännu en bit av det som ser ut att vara en optisk lins.",
    "portable": true
  },
  "komplett_stjärnlins": { // Kombinerat föremål
    "desc": "Två linsbitar som passar perfekt ihop och bildar en komplett, om än repig, stjärnlins.",
    "portable": true
  },
  "vissna_bär": {
    "desc": "Några mörka, skrumpna bär. De ser inte aptitliga ut.",
    "portable": true
  },
  "yxa": { // Kan finnas gömd någonstans tidigt, eller kräva en liten uppgift.
    "desc": "En sliten men fortfarande vass yxa. Bra för att hugga ner mindre träd eller rensa snår.",
    "portable": true
  },
  "trasigt_andningsskydd": {
    "desc": "Ett gammalt andningsskydd. Det är skadat och skulle inte ge mycket skydd.",
    "portable": true // Kan kanske repareras?
  },
  "livets_lilla_knopp": {
    "desc": "En liten, grön knopp som dök upp på den Sårade Väktaren efter att du hjälpt den. Den pulserar svagt med liv.",
    "portable": true
  },
  "runsten_del3": {
    "desc": "Den sista biten av runstenen. Tillsammans bildar de en komplett symbol för 'öppning' eller 'passage'.",
    "portable": true
  },
  "heligt_vatten_flaska": { // Resultat av att rena källvatten
    "desc": "En flaska med klart, skimrande vatten. Det utstrålar en renande energi.",
    "portable": true
  },
  "livets_frö": {
    "desc": "Ett litet, gyllene frö som du fann i den heliga lunden. Det vibrerar av outnyttjad potential.",
    "portable": true
  },
  "samlad_runsten": { // Kombinerat föremål
      "desc": "De tre runstensdelarna ihopsatta till en komplett sten med en lysande symbol.",
      "portable": true
  }
}