// Engine UI strings, per language. The active language is chosen by meta.lang.
// World content (places/items/actions/synonyms) is authored per language as well;
// to translate the game, translate this table plus the four content files.
const strings = {
  "en": {
    "youSee": "You see: {items}",
    "paths": "Paths lead: {exits}",
    "hereYouFind": "Here you find: {items}",
    "whatTake": "What do you want to pick up?",
    "unknownThing": "I don't know what \"{word}\" is.",
    "notHere": "There is no {word} here.",
    "cantTake": "You can't pick up the {word}.",
    "youTake": "You pick up the {word}.",
    "whatDrop": "What do you want to drop?",
    "dontHave": "You are not carrying any {word}.",
    "youDrop": "You put down the {word}.",
    "cantGo": "You can't go {dir} from here.",
    "whereGo": "Where do you want to go? Try a direction such as north, south, east, west, up or down.",
    "youCarry": "You are carrying: {inv}",
    "nothing": "nothing",
    "cantDoThat": "That doesn't work here.",
    "lightWhat": "What do you want to turn on or off?",
    "quitMessage": "Game over. Thanks for playing!",
    "dontUnderstand": "I don't understand. Type \"help\" for a list of commands.",
    "victory": "*** Congratulations - you reached the goal and won the game! ***",
    "helpLines": [
      "--- Help ---",
      "Type commands to interact with the world. Use simple verbs and nouns.",
      "Examples:",
      "  look               - Describe the room again.",
      "  look at <thing>    - Examine a specific thing.",
      "  take <thing>       - Pick something up.",
      "  drop <thing>       - Put something down.",
      "  go <direction>     - Move (e.g. \"go north\", or just \"n\").",
      "  look around        - List exits and items here.",
      "  inventory          - Show what you are carrying.",
      "  help               - Show this help text.",
      "  quit               - End the game.",
      ""
    ],
    "helpExits": "You can see paths leading: {exits}.",
    "helpItems": "You notice a few things here: {items}.",
    "helpNoItems": "Nothing here can be picked up right now, but try looking closer at your surroundings.",
    "statLocation": "Location",
    "statHealth": "Health",
    "statItems": "Items",
    "fillerWords": ["at", "the", "a", "an", "on", "in", "to"],
    "directionNames": {
      "north": "north", "south": "south", "east": "east",
      "west": "west", "up": "up", "down": "down"
    }
  },
  // Swedish engine strings, kept as a template for re-adding a Swedish world later.
  // Activate by setting meta.lang = 'sv' and authoring Swedish content files.
  "sv": {
    "youSee": "Du ser: {items}",
    "paths": "Vägar: {exits}",
    "hereYouFind": "Här finns: {items}",
    "whatTake": "Vad vill du plocka upp?",
    "unknownThing": "Jag förstår inte vad \"{word}\" är.",
    "notHere": "Det finns ingen {word} här.",
    "cantTake": "Du kan inte plocka upp {word}.",
    "youTake": "Du plockar upp {word}.",
    "whatDrop": "Vad vill du släppa?",
    "dontHave": "Du bär inte på någon {word}.",
    "youDrop": "Du lägger ner {word}.",
    "cantGo": "Du kan inte gå {dir} härifrån.",
    "whereGo": "Vart vill du gå? Försök med en riktning som norr, söder, öster, väster, upp eller ned.",
    "youCarry": "Du bär: {inv}",
    "nothing": "inget",
    "cantDoThat": "Det fungerar inte här.",
    "lightWhat": "Vad vill du tända eller släcka?",
    "quitMessage": "Spelet avslutat. Tack för att du spelade!",
    "dontUnderstand": "Jag förstår inte. Skriv \"hjälp\" för en lista över kommandon.",
    "victory": "*** Grattis - du nådde målet och vann spelet! ***",
    "helpLines": [
      "--- Hjälp ---",
      "Skriv kommandon för att interagera med världen. Använd enkla verb och substantiv.",
      ""
    ],
    "helpExits": "Du kan se vägar som leder: {exits}.",
    "helpItems": "Du ser några saker här: {items}.",
    "helpNoItems": "Du ser inget du kan plocka upp just nu, men prova att titta närmare på omgivningen.",
    "statLocation": "Plats",
    "statHealth": "Hälsa",
    "statItems": "Föremål",
    "fillerWords": ["på", "en", "ett", "den", "det"],
    "directionNames": {
      "north": "norr", "south": "söder", "east": "öster",
      "west": "väster", "up": "upp", "down": "ned"
    }
  }
};
