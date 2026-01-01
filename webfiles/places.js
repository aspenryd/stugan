const places = {
  "stugan": {
    desc: "Du står i den välbekanta stugan. Det luktar nysågat barrträ. Ett mjukt ljus sipprar in genom det dammiga fönstret.",
    longDesc: "Stockved ligger prydligt staplad… det svaga knarrandet från timmerstockarna påminner…",
    ascii: `
       __
      __|_|____
     /       / \\
    /_______/ /|
    |  __   |/ |
    | |  |  | /|
    |_|__|__|/
    `,
    items: ["ficklampa", "dagbok"],
    exits: { "söder": "gläntan", "ned": "källaren" }
  },
  "källaren": {
    "desc": "Källaren är mörk, fuktig och luktar jord. Ett svagt dropp ekar i mörkret.",
    "items": [],
    "exits": { "upp": "stugan" }
  },
  "gläntan": {
    "desc": "Du står i månskenet på en liten glänta omgiven av höga granar. En stig leder österut och en annan västerut.",
    "items": [],
    "exits": { "norr": "stugan", "öster": "sjökanten", "väster": "rävgryt" }
  },
  "sjökanten": {
    "desc": "Du står vid kanten av en svart spegelblank tjärn. Näcken tycks vaka i dunklet.",
    "items": [],
    "exits": { "väster": "gläntan" }
  },
  "rävgryt": {
    "desc": "Här doftar det av fuktig mossa och du hör lågmält ylande längre in i mörkret.",
    "items": ["rep"],
    "exits": { "öster": "gläntan", "ned": "rotsystemet" }
  },
  "rotsystemet": {
    "desc": "Ett labyrintiskt nätverk av rötter slingrar sig som naturliga gångar. Upp leder tillbaka och österut ser du rostigt järn.",
    "items": [],
    "exits": { "upp": "rävgryt", "öster": "lokstall" }
  },
  "lokstall": {
    "desc": "Ett mossbevuxet lokomotiv från 1912 står gömt i en underjordisk katedral av rötter. Ett bråddjupt schakt gapar mörkt i golvet.",
    "items": [],
    "exits": { "väster": "rotsystemet" }
  },
  "myreld": {
    "desc": "Du har segrat mot mörkret! Du står vid Skogens Hjärta. En pulserande värme fyller dig. Det är över.",
    "items": [],
    "exits": { "upp": "lokstall" }
  }
}
