const actions = {
  "*": [
    {
      "pattern": "\\b(light|turn on|switch on|ignite)\\b.*\\b(flashlight|torch|lamp)\\b",
      "conditions": ["not_has:flashlight"],
      "response": "You don't have a flashlight.",
      "hint": "turn on flashlight"
    },
    {
      "pattern": "\\b(turn off|switch off|extinguish|douse)\\b.*\\b(flashlight|torch|lamp)\\b",
      "conditions": ["not_has:flashlight"],
      "response": "You don't have a flashlight.",
      "hint": "turn off flashlight"
    },
    {
      "pattern": "\\b(light|turn on|switch on|ignite)\\b.*\\b(flashlight|torch|lamp)\\b",
      "conditions": ["has:flashlight", "item:flashlight:on"],
      "response": "The flashlight is already on.",
      "hint": "turn on flashlight"
    },
    {
      "pattern": "\\b(light|turn on|switch on|ignite)\\b.*\\b(flashlight|torch|lamp)\\b",
      "conditions": ["has:flashlight", "item:flashlight:off"],
      "response": "You turn on the flashlight. A narrow beam of light cuts through the dark.",
      "state_change": { "item": "flashlight", "state": "on" },
      "hint": "turn on flashlight"
    },
    {
      "pattern": "\\b(turn off|switch off|extinguish|douse)\\b.*\\b(flashlight|torch|lamp)\\b",
      "conditions": ["has:flashlight", "item:flashlight:off"],
      "response": "You fumble for the switch, but the flashlight is already off.",
      "hint": "turn off flashlight"
    },
    {
      "pattern": "\\b(turn off|switch off|extinguish|douse)\\b.*\\b(flashlight|torch|lamp)\\b",
      "conditions": ["has:flashlight", "item:flashlight:on"],
      "response": "You turn off the flashlight. The darkness closes in around you.",
      "state_change": { "item": "flashlight", "state": "off" },
      "hint": "turn off flashlight"
    },
    {
      "pattern": "\\b(open|read|study)\\b.*\\b(diary|book|journal)\\b",
      "conditions": ["has:diary"],
      "response": "A worn diary full of cryptic notes. One line is underlined: 'What the cellar hides, only light will find.'",
      "hint": "read diary"
    },
    {
      "pattern": "\\b(read|study)\\b.*\\b(map|chart)\\b",
      "conditions": ["has:map"],
      "response": "A hand-drawn sketch of a deep shaft beneath the engine shed. Someone has written: 'Tie the rope to the iron beam.'",
      "hint": "read map"
    }
  ],
  "cabin": [
    {
      "pattern": "\\b(look|peer|gaze)\\b.*\\bwindow\\b",
      "response": "The windowpane is too grimy to see anything clearly. You can only make out the moonlight outside.",
      "hint": "look at window"
    }
  ],
  "cellar": [
    {
      "pattern": "\\b(search|sweep|scan|feel|shine)\\b",
      "conditions": ["has:key"],
      "response": "You search the cellar again, but find nothing more of interest.",
      "hint": "search"
    },
    {
      "pattern": "\\b(search|sweep|scan|feel|shine)\\b",
      "conditions": ["has:flashlight", "item:flashlight:on"],
      "response": "In the beam of the flashlight you see a rusty key glinting on the dirt floor.",
      "reveals": ["key"],
      "hint": "search"
    },
    {
      "pattern": "\\b(search|sweep|scan|feel|shine)\\b",
      "response": "It is pitch black down here. You fumble around but find nothing. You need some light.",
      "hint": "search"
    }
  ],
  "lakeside": [
    {
      "pattern": "\\b(listen|hear)\\b",
      "conditions": ["item:flashlight:on"],
      "response": "You gaze across the mirror-still tarn, but hear nothing except the sigh of the wind.",
      "hint": "listen"
    },
    {
      "pattern": "\\b(listen|hear)\\b",
      "response": "A mournful eight-bit melody drifts across the water as you listen. Something very old lives in this lake.",
      "hint": "listen"
    }
  ],
  "engineshed": [
    {
      "pattern": "\\b(open|unlock)\\b.*\\b(toolbox|box|chest)\\b",
      "conditions": ["has:key"],
      "response": "The rusty key turns with a squeal and the padlock springs open. Inside the toolbox you find a folded map.",
      "reveals": ["map"],
      "hint": "open toolbox"
    },
    {
      "pattern": "\\b(open|unlock|force)\\b.*\\b(toolbox|box|chest)\\b",
      "response": "The toolbox is locked. A heavy, rusty padlock holds it shut.",
      "hint": "open toolbox"
    },
    {
      "pattern": "\\b(tie|fasten|attach|secure|use)\\b.*\\b(rope|line|cord)\\b",
      "conditions": ["has:rope", "item:rope:loose"],
      "response": "You tie the rope around a rusty iron beam and throw the end down into the darkness of the shaft.",
      "state_change": { "item": "rope", "state": "tied" },
      "reveals_exit": { "direction": "down", "destination": "forestheart" },
      "hint": "tie rope"
    },
    {
      "pattern": "\\b(tie|fasten|attach|secure|use)\\b.*\\b(rope|line|cord)\\b",
      "conditions": ["has:rope", "item:rope:tied"],
      "response": "The rope is already tied securely to the beam.",
      "hint": "tie rope"
    },
    {
      "pattern": "\\b(tie|fasten|attach|secure|use)\\b.*\\b(rope|line|cord)\\b",
      "response": "You have no rope to tie.",
      "hint": "tie rope"
    },
    {
      "pattern": "^\\s*(go\\s+|climb\\s+|head\\s+)?(d|down|downward|descend)\\b",
      "conditions": ["has:rope", "item:rope:loose"],
      "response": "The shaft is far too steep. You have a rope, but you need to fasten it to something first.",
      "hint": "down"
    },
    {
      "pattern": "^\\s*(go\\s+|climb\\s+|head\\s+)?(d|down|downward|descend)\\b",
      "conditions": ["not_has:rope"],
      "response": "The shaft is far too steep to climb. You need something to climb down with.",
      "hint": "down"
    }
  ]
}
