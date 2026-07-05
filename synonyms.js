const synonyms = {
  // --- Verbs (canonical names must match the GameCore verb switch) ---
  take:      ['take', 'get', 'grab', 'pick', 'pick up', 'collect'],
  drop:      ['drop', 'put down', 'discard'],
  look:      ['look', 'look at', 'examine', 'inspect', 'view', 'check', 'l'],
  survey:    ['survey', 'look around', 'around', 'exits', 'where'],
  describe:  ['describe'],
  light:     ['light', 'ignite', 'extinguish'],
  use:       ['use', 'open', 'unlock', 'tie', 'fasten', 'attach', 'secure',
              'listen', 'hear', 'search', 'read', 'turn', 'switch'],
  inventory: ['inventory', 'inv', 'i', 'items', 'bag', 'belongings'],
  move:      ['go', 'walk', 'move', 'head', 'run', 'climb', 'enter'],
  help:      ['help', 'h', '?'],
  quit:      ['quit', 'q', 'exit', 'end'],

  // --- Directions (canonical direction tokens used in place exits) ---
  north: ['n'],
  south: ['s'],
  east:  ['e'],
  west:  ['w'],
  up:    ['u', 'upward', 'upstairs', 'ascend'],
  down:  ['d', 'downward', 'downstairs', 'descend'],

  // --- Items (map any typed word to the internal item id) ---
  flashlight: ['flashlight', 'torch', 'lamp'],
  diary:      ['diary', 'book', 'journal'],
  key:        ['key'],
  rope:       ['rope', 'line', 'cord'],
  toolbox:    ['toolbox', 'box', 'chest'],
  map:        ['map', 'chart']
};
