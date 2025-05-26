const synonyms = {
  // --- Verbs (must match your doXXX switch cases) ---
  take:      ['ta', 'ta upp', 'plocka upp', 'plocka', 'plocka upp', 'ryck', 'grab'],
  look:      ['titta på', 'titta', 'se', 'betrakta'],
  survey:    ['titta runt', 'utforska', 'rundblick', 'runt', 'tittarunt'],
  light:     ['tänd', 'tända', 'släck', 'släcka', 'ljus', 'lys', 'belys', 'skingra'],
  inventory: ['inventering', 'inventera', 'inventarium', 'saker', 'bagage', 'föremål'],
  move:      ['gå', 'gå till', 'gå söderut', 'gå norrut', 'gå österut', 'gå västerut', 'gå upp', 'gå ner', 'förflytta', 'kliv', 'move'],
  help:      ['hjälp', '?', 'hjälp!'],
  describe:  ['beskriv','granska'],
  quit:      ['sluta', 'avsluta', 'lämna', 'exit'],

  // --- Items (map any typed word to your internal ID) ---
  dagbok:    ['dagbok', 'bok'],
  ficklampa: ['ficklampa', 'ficklampan', 'lampa', 'lampan'],
  nyckel:    ['nyckel'],
  rep:       ['rep', 'tamp', 'repet']
};
