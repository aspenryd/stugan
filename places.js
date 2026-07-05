const places = {
  "cabin": {
    "name": "The Cabin",
    "desc": "You are standing in the familiar cabin. It smells of freshly sawn pine, and soft light seeps in through a dusty window.",
    "longDesc": "Firewood is stacked neatly by the stove, and the timber walls creak softly, as if the cabin were breathing. A dusty window faces the moonlit forest to the south, and a trapdoor in the floor leads down into darkness.",
    "ascii": `
       __
      __|_|____
     /       / \\
    /_______/ /|
    |  __   |/ |
    | |  |  | /|
    |_|__|__|/
    `,
    "items": ["flashlight", "diary"],
    "exits": { "south": "clearing", "down": "cellar" }
  },
  "cellar": {
    "name": "The Cellar",
    "desc": "The cellar is pitch dark and damp, and it smells of earth. A slow drip echoes somewhere in the blackness. Perhaps you should search it - if you had some light.",
    "descVariants": [
      {
        "conditions": ["has:flashlight", "item:flashlight:on"],
        "desc": "The flashlight's beam sweeps over the damp earthen walls of the cellar and a packed dirt floor. It is small and low - a good place to search."
      }
    ],
    "items": [],
    "exits": { "up": "cabin" }
  },
  "clearing": {
    "name": "The Clearing",
    "desc": "You stand in the moonlight in a small clearing surrounded by tall spruces. A path leads east toward water, and another leads west toward a dark mound.",
    "items": [],
    "exits": { "north": "cabin", "east": "lakeside", "west": "foxden" }
  },
  "lakeside": {
    "name": "The Lakeside",
    "desc": "You stand at the edge of a black, mirror-still tarn. Something seems to be watching you from the dark water. It is very quiet here - almost worth listening to.",
    "items": [],
    "exits": { "west": "clearing" }
  },
  "foxden": {
    "name": "The Fox Den",
    "desc": "The air smells of damp moss, and you hear low howling somewhere deeper in the dark. A burrow opening leads down between the roots.",
    "items": ["rope"],
    "exits": { "east": "clearing", "down": "rootmaze" }
  },
  "rootmaze": {
    "name": "The Root Maze",
    "desc": "A labyrinth of roots twists into natural tunnels. Up leads back to the den, and to the east you glimpse rusty iron.",
    "items": [],
    "exits": { "up": "foxden", "east": "engineshed" }
  },
  "engineshed": {
    "name": "The Engine Shed",
    "desc": "A moss-covered locomotive from 1912 stands hidden in an underground cathedral of roots. A rusty toolbox sits by the wheels, and a sheer shaft gapes darkly in the floor.",
    "items": ["toolbox"],
    "exits": { "west": "rootmaze" }
  },
  "forestheart": {
    "name": "The Heart of the Forest",
    "desc": "You have conquered the darkness! You stand at the Heart of the Forest, and a pulsing warmth fills you. It is over.",
    "items": [],
    "exits": { "up": "engineshed" }
  }
}
