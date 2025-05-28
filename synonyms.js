const synonyms = {
  // --- Verbs (must match your doXXX switch cases) ---
  take:      ['ta', 'tag', 'ta upp', 'plocka upp', 'plocka', 'hämta', 'skaffa', 'ryck', 'grab'],
  look:      ['titta på', 'titta', 'se', 'betrakta', 'undersök', 'inspektera', 'granska'],
  survey:    ['titta runt', 'utforska', 'rundblick', 'runt', 'se dig omkring', 'kolla runt'],
  light:     ['tänd', 'tända', 'släck', 'släcka', 'ljus', 'lys', 'belys', 'skingra mörkret'],
  inventory: ['inventering', 'inventera', 'inventarium', 'saker', 'bagage', 'föremål', 'ryggsäck', 'väska', 'kappsäck', 'grejer', 'vad har jag'],
  move:      ['gå', 'gå till', 'gå söderut', 'gå norrut', 'gå österut', 'gå västerut', 'gå upp', 'gå ner', 'förflytta', 'kliv', 'spring', 'löp', 'förflytta sig', 'marschera', 'promenera'],
  help:      ['hjälp', '?', 'hjälp!', 'instruktioner', 'vad gör jag'],
  describe:  ['beskriv','granska', 'berätta mer', 'detaljer'],
  quit:      ['sluta', 'avsluta', 'lämna', 'exit', 'ge upp', 'stäng av'],
  use:       ['använd', 'bruka', 'nyttja', 'använda'], // Added 'use' as a common verb
  combine:   ['kombinera', 'sätt ihop', 'montera', 'skapa', 'bygga', 'förena'], // Added 'combine'

  // --- Items (map any typed word to your internal ID) ---
  dagbok:         ['dagbok', 'bok', 'anteckningsbok', 'journal'],
  lykta:          ['lykta', 'lampan', 'fotogenlykta', 'rostiglykta', 'lampa'],
  nyckel:         ['nyckel', 'rostignyckel', 'gammalnyckel', 'uråldrignyckel'],
  mossklump:      ['mossklump', 'mossa', 'glimmandemossa', 'lysandemossa', 'grönmossa'],
  kristall:       ['kristall', 'renandekristall', 'pulserandekristall', 'klar kristall'],
  drivved:        ['drivved', 'ved', 'träbitar', 'plankor'],
  rep:            ['rep', 'tamp', 'repet', 'näverrep', 'starkt rep'],
  flotte:         ['flotte', 'båt', 'farkost', 'träflotte'],
  runstenbit:     ['runstenbit', 'stenbit', 'runbit', 'bit', 'första runstenbiten', 'runsten del1'], // Updated
  trälåda:        ['trälåda', 'låda', 'kista', 'låst låda', 'väderbiten låda', 'trälåda låst'], // Updated
  fotogen:        ['fotogen', 'fotogenflaska', 'bränsle', 'lampolja', 'flaska', 'fotogen flaska'], // Updated
  sömnsvamp:      ['sömnsvamp', 'svamp', 'lilasvamp', 'sömnmedel'],
  styrkesvamp:    ['styrkesvamp', 'svamp', 'rödsvamp', 'stärkandesvamp', 'kraftsvamp', 'stärkande svamp'], // Updated
  runstenbitett:  ['runstenbitett', 'runstenbit', 'stenbit', 'bit', 'andra runstenbiten', 'runstensbit ett', 'runsten del2'], // Updated
  örnfjäder:      ['örnfjäder', 'fjäder', 'örnfjader', 'stor fjäder', 'vacker fjäder', 'örn fjäder'], // Updated
  linsbit:        ['linsbit', 'lins', 'glasbit', 'kristallglasbit', 'slipad linsbit', 'första linsbiten', 'stjärnlins bit1'], // Updated
  linsbitett:     ['linsbitett', 'linsbit', 'lins', 'glasbit', 'andra linsbiten', 'linsbit ett', 'stjärnlins bit2'], // Updated
  stjärnlins:     ['stjärnlins', 'lins', 'komplett lins', 'repad lins', 'komplett stjärnlins'], // Updated
  bär:            ['bär', 'mörkabär', 'skrumpnabär', 'giftigabär', 'vissna bär'], // Updated
  yxa:            ['yxa', 'slitenyxa', 'vassyxa', 'träyxa'],
  andningsskydd:  ['andningsskydd', 'skydd', 'mask', 'gammalt skydd', 'trasigt andningsskydd'], // Updated
  livsknopp:      ['livsknopp', 'knopp', 'grönknopp', 'växtknopp', 'livets lilla knopp'], // Updated
  runstenbittva:  ['runstenbittva', 'runstenbit', 'stenbit', 'bit', 'tredje runstenbiten', 'runstensbit två', 'runsten del3'], // Updated
  källvatten:     ['källvatten', 'vatten', 'heligtvatten', 'flaska med vatten', 'renande vatten', 'heligt vatten flaska'], // Updated
  livsfrö:        ['livsfrö', 'frö', 'gyllenefrö', 'magiskt frö', 'livets frö'], // Updated
  runsten:        ['runsten', 'komplettrunsten', 'lysandesten', 'symbolsten', 'samlad runsten'], // Updated

  // --- Custom Exit Directions ---
  "tillbaka": ["tillbaka", "gå tillbaka", "återvänd"],
  "framåt": ["framåt", "fortsätt", "gå framåt", "vidare"],
  "djupare": ["djupare", "gå djupare", "längre in", "fortsätt djupare"],
  "över_sjön": ["över sjön", "korsa sjön", "segla över sjön", "ta flotten över sjön", "gå över sjön"],
  "tillbaka_över_sjön": ["tillbaka över sjön", "segla tillbaka", "återvänd över sjön", "ta flotten tillbaka"],
  "gång": ["gång", "gå gången", "följ gången", "in i gången"],
  "kryp_in": ["kryp in", "kryp igenom hålet", "genom hålet", "in i hålet"],
  "kryp_ut": ["kryp ut", "kryp tillbaka", "ut ur tunneln"],
  "mot_ljuset": ["mot ljuset", "gå mot ljuset", "följ ljuset"],
  "uppåt_via_rötter": ["klättra uppför rötterna", "uppför rötterna", "upp via rötter", "klättra rötter", "klättra upp rötterna"],
  "nedåt_stigen": ["nedåt stigen", "gå nedåt stigen", "följ stigen nedåt", "nerför stigen"],
  "klättra_ner_i_nästet": ["klättra ner i nästet", "ner i nästet", "klättra ner", "gå ner i boet", "in i nästet"],
  "klättra_upp_ur_nästet": ["klättra upp ur nästet", "upp ur nästet", "klättra upp", "ut ur nästet"],
  "mot_ruinerna": ["mot ruinerna", "gå mot ruinerna", "till ruinerna"],
  "tillbaka_mot_toppen": ["tillbaka mot toppen", "gå tillbaka mot toppen", "återvänd mot toppen", "uppåt mot toppen"],
  "uppför_trappan": ["uppför trappan", "gå uppför trappan", "ta trappan upp"],
  "nedför_trappan": ["nedför trappan", "gå nedför trappan", "ta trappan ner"],
  "studera_stjärnkartan": ["studera stjärnkartan", "titta på stjärnkartan", "undersök kartan", "använd stjärnkartan"],
  "nedåt_genom_rötter": ["nedåt genom rötter", "klättra ner genom rötter", "ner genom rötterna"],
  "in_i_skogen": ["in i skogen", "gå in i skogen", "djupare in i skogen"],
  "tillbaka_gläntan": ["tillbaka till gläntan", "gå tillbaka till gläntan", "återvänd till gläntan"],
  "genom_snåren": ["genom snåren", "gå genom snåren", "passera snåren", "rensa snåren"],
  "tillbaka_stigen": ["tillbaka till stigen", "gå tillbaka till stigen", "följ stigen tillbaka"],
  "försök_korsa": ["försök korsa", "korsa träsket", "gå över träsket", "korsa"],
  "tillbaka_kanten": ["tillbaka till kanten", "gå tillbaka till kanten", "återvänd till kanten"],
  "mot_jätten": ["mot jätten", "gå mot jätten", "närma dig jätten"],
  "tillbaka_träsket": ["tillbaka till träsket", "gå tillbaka genom träsket", "återvänd genom träsket"],
  "hemlig_gång": ["hemlig gång", "gå genom hemlig gång", "ta hemliga gången", "in i hemliga gången"],
  "ut_observatoriet": ["ut ur observatoriet", "lämna observatoriet", "gå ut från observatoriet"],
  "in_i_passagen": ["in i passagen", "gå in i passagen", "fortsätt in i passagen"],
  "ut_igen": ["ut igen", "gå ut igen", "lämna rummet"],
  "rör_piedestalen": ["rör piedestalen", "använd piedestalen", "interagera med piedestalen"],
  "gå_igenom_portalen": ["gå igenom portalen", "passera portalen", "genom portalen", "använd portalen", "kliv in i portalen"],
  "tillbaka_stjärnrummet": ["tillbaka till stjärnrummet", "gå tillbaka till stjärnrummet", "ut från portalrummet"],
  "tillbaka_väktaren": ["tillbaka till väktaren", "gå tillbaka till väktaren", "återvänd till väktaren"],
  "gå_igenom_porten": ["gå igenom porten", "passera porten", "genom porten", "använd porten"],
  "ut_porten": ["ut genom porten", "lämna lunden", "gå ut porten"],
  "följ_stigen": ["följ stigen", "gå längs stigen", "ta stigen"],
  "framåt_efter_prövning": ["framåt efter prövning", "fortsätt efter prövningen", "gå vidare"],
  "öppna_dörren": ["öppna dörren", "gå genom dörren", "passera dörren"]
};
