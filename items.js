const items = {
  "dagbok": {
    "desc": "En sliten dagbok fylld med kryptiska marginalanteckningar och en grov karta över skogens utkant. Innehåller ledtrådar om skogens hemligheter.",
    "portable": true,
    "story": "Dagboken tillhörde en av dina förfäder. Den talar om 'Skogens Hjärta', en plats med stor makt, och en 'smygande skugga' som hotar den. Den nämner också den uråldriga eken."
  },
  "lykta": {
    "desc": "En gammal, rostig fotogenlykta. Glaset är intakt, men den saknar fotogen och kan inte tändas i sitt nuvarande skick.",
    "portable": true,
    "state": "Släckt", // Kan vara Tänd, Släckt, Tom
    "fuel": 0 // 0-100
  },
  "nyckel": {
    "desc": "En tung, rostig nyckel med ett intrikat och uråldrigt mönster. Den verkar gammal och viktig. Passar den till något i rotkällaren?",
    "portable": true
  },
  "mossklump": {
    "desc": "En klump av självlysande mossa. Den avger ett svagt, spöklikt grönt sken som kan lysa upp dina omedelbara omgivningar.",
    "portable": true,
    "state": "Lysande" // Kan vara Lysande, Falnad
  },
  "kristall": {
    "desc": "En klar, pulserande kristall som avger en svag värme. Den sägs ha renande egenskaper och kan motverka vissa gifter samt rena orent vatten.",
    "portable": true
  },
  "drivved": {
    "desc": "Några stadiga bitar av väderbiten drivved. De är tillräckligt stora och robusta för att kunna användas för att bygga någon form av flytanordning.",
    "portable": true // Kanske bara om man har rep? Eller så är de tunga.
  },
  "rep": { // Antag att detta är original-repet eller ett liknande nytt.
    "desc": "Ett starkt och smidigt rep, tillverkat av tvinnad näver. Det luktar friskt av skog och kåda.",
    "portable": true,
    "state": "Löst" // Kan vara Löst, Fastbundet
  },
  "flotte": { // Kombinerat föremål
    "desc": "En enkel men funktionell flotte, hopbunden av drivved och rep. Den ser ut att kunna bära en person över lugna vatten.",
    "portable": false, // Stannar vid sjön
    "state": "Sjöduglig"
  },
  "runstenbit": { // Tidigare runsten_del1
    "desc": "En avslagen bit av en större runsten, med en del av en uråldrig symbol tydligt ingraverad.",
    "portable": true
  },
  "trälåda": { // Tidigare trälåda_låst
    "desc": "En liten, väderbiten trälåda med ett kraftigt, rostigt lås. Den är förvånansvärt tung för sin storlek och skramlar dovt när man rör den.",
    "portable": false // Blir innehållet portabelt
  },
  "fotogen": { // Tidigare fotogen_flaska
    "desc": "En nästan full glasflaska innehållande klar fotogen. Bränsle som är perfekt för lyktan.",
    "portable": true
  },
  "sömnsvamp": {
    "desc": "En mjuk, lila svamp som avger en sötaktig, nästan bedövande doft. Vid beröring frigörs sporer som kan få den oförsiktige att somna djupt.",
    "portable": true
  },
  "styrkesvamp": { // Tidigare stärkande_svamp
    "desc": "En röd, fast svamp med jordig doft. Känd inom folktron för att ge tillfällig, men avsevärd, ökning i styrka och uthållighet.",
    "portable": true
  },
  "runstenbitett": { // Tidigare runsten_del2
    "desc": "Ytterligare en bit av en runsten, med en annan del av samma uråldriga symbol. Symbolen börjar ta form men är ännu inte komplett.",
    "portable": true
  },
  "örnfjäder": { // Tidigare örn_fjäder
    "desc": "En stor, vacker fjäder från en kungsörn. Den är perfekt tecknad och känns både lätt och anmärkningsvärt stark i handen.",
    "portable": true
  },
  "linsbit": { // Tidigare stjärnlins_bit1
    "desc": "En noggrant slipad bit av kristallklart glas, sannolikt en del av en större, komplex optisk lins. Kanterna är skarpa.",
    "portable": true
  },
  "linsbitett": { // Tidigare stjärnlins_bit2
    "desc": "Ännu en bit av slipat kristallglas, liknande den första. Den ser ut att kunna passa ihop med en annan bit för att forma en lins.",
    "portable": true
  },
  "stjärnlins": { // Tidigare komplett_stjärnlins
    "desc": "Två individuella linsbitar som har fogats samman perfekt. Tillsammans bildar de en komplett, om än något repig, stjärnlins, kapabel att fokusera ljus på ett speciellt sätt.",
    "portable": true
  },
  "bär": { // Tidigare vissna_bär
    "desc": "Några mörka, skrumpna bär som hänger i en liten klase. De ser inte aptitliga ut och kan vara giftiga.",
    "portable": true
  },
  "yxa": {
    "desc": "En sliten men fortfarande imponerande vass yxa med ett robust träskaft. Utmärkt för att hugga ner mindre träd, rensa snår eller som ett improviserat vapen.",
    "portable": true
  },
  "andningsskydd": { // Tidigare trasigt_andningsskydd
    "desc": "Ett gammalt andningsskydd av läder och metall. Det är tydligt skadat, med revor i tyget och bucklor i metallen, och skulle inte ge mycket skydd mot farliga gaser.",
    "portable": true // Kan kanske repareras?
  },
  "livsknopp": { // Tidigare livets_lilla_knopp
    "desc": "En liten, spägrön knopp som mirakulöst dök upp på den Sårade Väktaren efter att du hjälpt den. Den pulserar med ett svagt, varmt ljus och utstrålar livskraft.",
    "portable": true
  },
  "runstenbittva": { // Tidigare runsten_del3
    "desc": "Den sista biten av den fragmenterade runstenen. Med denna bit blir symbolen komplett och uttyds som 'öppning' eller 'passage'.",
    "portable": true
  },
  "källvatten": { // Tidigare heligt_vatten_flaska
    "desc": "En flaska fylld med klart, skimrande vatten från en helig källa. Vattnet utstrålar en renande och helande energi, och känns svalt vid beröring.",
    "portable": true
  },
  "livsfrö": { // Tidigare livets_frö
    "desc": "Ett litet, gyllene frö som du fann i den heliga lunden, skyddat av uråldrig magi. Det vibrerar svagt i din hand och är fyllt av outnyttjad potential och livsenergi.",
    "portable": true
  },
  "runsten": { // Tidigare samlad_runsten
      "desc": "De tre runstensdelarna har varsamt fogats samman och bildar nu en komplett sten. Den ingraverade symbolen lyser med ett stadigt, pulserande ljus.",
      "portable": true
  }
}