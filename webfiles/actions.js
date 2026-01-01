const actions = {
  "*": [
    {
      "pattern": "(släck|stäng av|dölj|tänd|tand|lys|light).*ficklampa",
      "conditions": ["not_has:ficklampa"],
      "response": "Du har ingen ficklampa.",
    },
    {
      "pattern": "(tänd|tand|lys|light).*ficklampa",
      "conditions": ["has:ficklampa", "item:ficklampa:På"],
      "response": "Ficklampan är redan tänd.",
    },
    {
      "pattern": "(tänd|tand|lys|light).*ficklampa",
      "conditions": ["has:ficklampa", "item:ficklampa:Av"],
      "response": "Du tänder ficklampan. En smal ljuskägla skär genom mörkret.",
      "state_change": { "item": "ficklampa", "state": "På" }
    },
    {
      "pattern": "(släck|stäng av|dölj).*ficklampa",
      "conditions": ["has:ficklampa", "item:ficklampa:Av"],
      "response": "Du fumlar efter avstängningsknappen men hittar den inte efterom ficklampan redan är släckt.",
    },
    {
      "pattern": "(släck|stäng av|dölj).*ficklampa",
      "conditions": ["has:ficklampa", "item:ficklampa:På"],
      "response": "Du släcker ficklampan. Mörkret sluter sig om dig.",
      "state_change": { "item": "ficklampa", "state": "Av" }
    },
    {
      "pattern": "(öppna|läs|granska|titta).*dagbok",
      "conditions": ["has:dagbok"],
      "response": "En sliten dagbok fylld med kryptiska marginalanteckningar.",
    }
  ],
  "stugan": [
    {
      "pattern": "(titta|look|kika).*f(o|ö)nst(er|ret)",
      "response": "Fönsterrutan är för smutsig för att se något tydligt. Du anar bara månljuset där ute."
    }
  ],
  "källaren": [
    {
      "pattern": "(lys|titta|leta)",
      "conditions": ["item:ficklampa:På"],
      "response": "I ficklampans sken ser du en rostig nyckel glimma på jordgolvet.",
      "reveals": ["nyckel"]
    }
  ],
  "lokstall": [
    {
      "pattern": "(använd|knyt|fäst).*rep",
      "conditions": ["has:rep"],
      "response": "Du knyter repet runt en rostig balk och kastar ner änden i mörkret.",
      "state_change": { "item": "rep", "state": "Fäst" },
      "unlock_exits": { "ned": "myreld" }
    },
    {
      "pattern": "ned",
      "conditions": ["not_has:rep"],
      "response": "Det är för brant. Du behöver något att klättra i."
    },
    {
      "pattern": "ned",
      "conditions": ["has:rep", "item:rep:Av"],
      "response": "Det är för brant. Du har ett rep, men du måste fästa det först."
    }
  ],
  "myreld": [
    {
      "pattern": ".*",
      "response": "Du har nått Skogens Hjärta. Din resa slutar här... för den här gången. (Spelet är slut!)"
    }
  ],
  "sjökanten": [
    {
      "pattern": "(lyssna|listen|hör).*näck",
      "conditions": ["item:ficklampa:Av"],
      "response": "En vemodig 8‑bitarsmelodi svävar över vattnet när du lyssnar."
    },
    {
      "pattern": "(lyssna|listen|hör).*näck",
      "conditions": ["item:ficklampa:På"],
      "response": "Du tittar ut över den spegelblanka sjön men hör inget annat än vindens sus."
    }
  ]
}
