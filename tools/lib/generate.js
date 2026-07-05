// Procedural world generator. Given a seed it deterministically builds a
// forest-themed world: rooms carved on a 3D grid, a light-puzzle hiding a
// tool, and a gated final exit that the tool opens. The result uses exactly
// the same data format as the shipped world, so it can be dropped into
// webfiles/ (or any folder together with core.js/engine.js/index.html).

const DIRECTIONS = {
    north: { dx: 0, dy: -1, dz: 0, opposite: 'south', letter: 'n' },
    south: { dx: 0, dy: 1, dz: 0, opposite: 'north', letter: 's' },
    east: { dx: 1, dy: 0, dz: 0, opposite: 'west', letter: 'e' },
    west: { dx: -1, dy: 0, dz: 0, opposite: 'east', letter: 'w' },
    up: { dx: 0, dy: 0, dz: 1, opposite: 'down', letter: 'u' },
    down: { dx: 0, dy: 0, dz: -1, opposite: 'up', letter: 'd' }
};

// Deterministic PRNG (mulberry32).
function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const ROOM_TEMPLATES = [
    { id: 'trailhead', name: 'The Trailhead', desc: 'A worn signpost marks the start of an overgrown trail. The forest waits, dark and patient.' },
    { id: 'glade', name: 'The Glade', desc: 'A quiet glade opens up between mossy trunks. Sunbeams hang in the air like dust.' },
    { id: 'hollow', name: 'The Hollow', desc: 'You stand in a damp hollow where ferns grow taller than your shoulders.' },
    { id: 'ravine', name: 'The Ravine', desc: 'Steep stone walls rise on both sides. Somewhere below, water whispers.' },
    { id: 'brook', name: 'The Brook', desc: 'A cold brook chatters over smooth stones. Something glimmers beneath the surface, always out of reach.' },
    { id: 'cave', name: 'The Cave', desc: 'The mouth of a shallow cave exhales cool, earthy air.' },
    { id: 'ridge', name: 'The Ridge', desc: 'From this windswept ridge you can see treetops rolling away like a green sea.' },
    { id: 'marsh', name: 'The Marsh', desc: 'The ground squelches underfoot. Pale mist drifts between crooked birches.' },
    { id: 'grove', name: 'The Grove', desc: 'Ancient oaks form a near-perfect circle here. It feels like a room built by no one.' },
    { id: 'thicket', name: 'The Thicket', desc: 'Brambles tug at your sleeves. Paths through the thicket are narrow and secretive.' },
    { id: 'cairn', name: 'The Cairn', desc: 'A pile of carefully stacked stones stands here, older than any map.' },
    { id: 'mill', name: 'The Old Mill', desc: 'A ruined mill leans over a dry channel, its wheel long since still.' },
    { id: 'footbridge', name: 'The Footbridge', desc: 'A creaking footbridge spans a dark cleft in the forest floor.' },
    { id: 'den', name: 'The Badger Den', desc: 'Fresh diggings and a musky smell betray the den of something large and grumpy.' },
    { id: 'stand', name: 'The Pine Stand', desc: 'Identical pines stand in silent rows. It would be easy to get lost here.' },
    { id: 'boulders', name: 'The Boulder Field', desc: 'Giant boulders lie scattered as if thrown by trolls in some ancient quarrel.' },
    { id: 'spring', name: 'The Spring', desc: 'Clear water rises soundlessly from a crack in the rock, filling a perfect black pool.' },
    { id: 'lookout', name: 'The Lookout', desc: 'The rotten remains of a hunting tower cling to the tallest tree around.' }
];

const GOAL_TEMPLATE = {
    id: 'sanctum', name: 'The Forest Sanctum',
    desc: 'You step into a hidden sanctum where the whole forest seems to hold its breath. Warm light pulses between the roots. You have found what you were looking for.'
};

const FLAVOR_ITEMS = [
    { id: 'pinecone', name: 'Pinecone', desc: 'A perfectly ordinary pinecone. It smells like childhood.', portable: true },
    { id: 'feather', name: 'Feather', desc: 'A long grey feather from some very large bird.', portable: true },
    { id: 'stone', name: 'Stone', desc: 'A smooth stone with a pale ring running around it. Lucky, probably.', portable: true }
];

function generateWorld(options = {}) {
    const seed = Number.isFinite(options.seed) ? options.seed : 42;
    const roomCount = Math.max(4, Math.min(options.rooms || 8, ROOM_TEMPLATES.length));
    const title = options.name || `The Generated Forest #${seed}`;
    const rng = mulberry32(seed);

    const pick = arr => arr[Math.floor(rng() * arr.length)];
    const shuffled = arr => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    // --- 1. Carve rooms on a 3D grid with a random walk (guarantees a
    //        consistent, bidirectional maze). ---
    const templates = [ROOM_TEMPLATES[0], ...shuffled(ROOM_TEMPLATES.slice(1))].slice(0, roomCount);
    const cellKey = p => `${p.x},${p.y},${p.z}`;
    const rooms = [{ ...templates[0], pos: { x: 0, y: 0, z: 0 }, exits: {}, parent: null, depth: 0 }];
    const occupied = new Map([[cellKey(rooms[0].pos), rooms[0]]]);

    let guard = 0;
    while (rooms.length < roomCount && guard++ < 5000) {
        const from = pick(rooms);
        const dir = pick(Object.keys(DIRECTIONS));
        const d = DIRECTIONS[dir];
        const pos = { x: from.pos.x + d.dx, y: from.pos.y + d.dy, z: from.pos.z + d.dz };
        if (occupied.has(cellKey(pos))) continue;
        const room = { ...templates[rooms.length], pos, exits: {}, parent: from, parentDir: dir, depth: from.depth + 1 };
        from.exits[dir] = room.id;
        room.exits[d.opposite] = from.id;
        rooms.push(room);
        occupied.set(cellKey(pos), room);
    }

    // --- 2. The goal hangs off the deepest room, behind a gated exit. ---
    const gatekeeper = rooms.reduce((a, b) => (b.depth > a.depth ? b : a));
    let goalDir = Object.keys(DIRECTIONS).find(dir => {
        const d = DIRECTIONS[dir];
        const pos = { x: gatekeeper.pos.x + d.dx, y: gatekeeper.pos.y + d.dy, z: gatekeeper.pos.z + d.dz };
        return !occupied.has(cellKey(pos));
    }) || 'down';
    const goal = { ...GOAL_TEMPLATE, exits: { [DIRECTIONS[goalDir].opposite]: gatekeeper.id } };
    // Note: the exit gatekeeper -> goal is NOT added; an action reveals it.

    // --- 3. Occasionally connect adjacent rooms for loops (never the goal,
    //        so the gate stays the only way in). ---
    for (const room of rooms) {
        for (const [dir, d] of Object.entries(DIRECTIONS)) {
            if (room.exits[dir]) continue;
            const neighbor = occupied.get(cellKey({ x: room.pos.x + d.dx, y: room.pos.y + d.dy, z: room.pos.z + d.dz }));
            if (!neighbor || neighbor.exits[d.opposite]) continue;
            if (rng() < 0.15) {
                room.exits[dir] = neighbor.id;
                neighbor.exits[d.opposite] = room.id;
            }
        }
    }

    // --- 4. Puzzle chain: lantern (start) -> dark room hides the tool ->
    //        tool opens the gate. ---
    const start = rooms[0];
    const candidates = rooms.filter(r => r !== start && r !== gatekeeper);
    const darkRoom = candidates.length > 0 ? pick(candidates) : null;

    const items = {
        lantern: {
            name: 'Lantern', desc: 'A dented storm lantern. Its wick is dry and ready.',
            portable: true, state: 'off'
        },
        ladder: {
            name: 'Rope Ladder', desc: 'A rolled-up rope ladder with sturdy wooden rungs.',
            portable: true, state: 'unused'
        }
    };
    start.items = ['lantern'];

    // Sprinkle some flavor items in random rooms.
    for (const flavor of FLAVOR_ITEMS) {
        if (rng() < 0.6) {
            items[flavor.id] = { name: flavor.name, desc: flavor.desc, portable: flavor.portable };
            const room = pick(rooms);
            (room.items = room.items || []).push(flavor.id);
        }
    }

    const goalDirName = goalDir;
    const goalDirLetter = DIRECTIONS[goalDir].letter;

    const actions = {
        '*': [
            {
                pattern: '\\b(light|turn on|switch on|ignite)\\b.*\\b(lantern|lamp)\\b',
                conditions: ['not_has:lantern'],
                response: "You don't have a lantern.",
                hint: 'light lantern'
            },
            {
                pattern: '\\b(light|turn on|switch on|ignite)\\b.*\\b(lantern|lamp)\\b',
                conditions: ['has:lantern', 'item:lantern:on'],
                response: 'The lantern is already burning.',
                hint: 'light lantern'
            },
            {
                pattern: '\\b(light|turn on|switch on|ignite)\\b.*\\b(lantern|lamp)\\b',
                conditions: ['has:lantern', 'item:lantern:off'],
                response: 'You light the lantern. Warm light pushes the shadows back.',
                state_change: { item: 'lantern', state: 'on' },
                hint: 'light lantern'
            },
            {
                pattern: '\\b(turn off|switch off|extinguish|douse)\\b.*\\b(lantern|lamp)\\b',
                conditions: ['has:lantern', 'item:lantern:on'],
                response: 'You douse the lantern. The forest darkness rushes back in.',
                state_change: { item: 'lantern', state: 'off' },
                hint: 'douse lantern'
            }
        ]
    };

    if (darkRoom) {
        darkRoom.descVariants = [{
            conditions: ['has:lantern', 'item:lantern:on'],
            desc: darkRoom.desc + ' The lantern\'s glow reaches into a shadowy corner - a good place to search.'
        }];
        darkRoom.desc += ' It is pitch dark in one corner - searching it without a light seems hopeless.';
        actions[darkRoom.id] = [
            {
                pattern: '\\b(search|feel|scan|sweep|shine)\\b',
                conditions: ['has:ladder'],
                response: 'You search again, but there is nothing more to find.',
                hint: 'search'
            },
            {
                pattern: '\\b(search|feel|scan|sweep|shine)\\b',
                conditions: ['has:lantern', 'item:lantern:on'],
                response: 'In the lantern light you spot a rolled-up rope ladder stashed in the dark corner.',
                reveals: ['ladder'],
                hint: 'search'
            },
            {
                pattern: '\\b(search|feel|scan|sweep|shine)\\b',
                response: 'You grope around in the dark and find nothing. Some light would help.',
                hint: 'search'
            }
        ];
    } else {
        // Tiny world: the ladder just lies in a random non-start room.
        const room = pick(candidates.length ? candidates : rooms);
        (room.items = room.items || []).push('ladder');
    }

    gatekeeper.desc += ` A sheer drop blocks the way ${goalDirName}; you would need something to climb down with.`;
    actions[gatekeeper.id] = [
        {
            pattern: '\\b(use|unroll|lower|place|attach|fasten)\\b.*\\b(ladder|rope ladder)\\b',
            conditions: ['has:ladder', 'item:ladder:unused'],
            response: `You fasten the rope ladder and let it unroll into the depths. The way ${goalDirName} is open.`,
            state_change: { item: 'ladder', state: 'fastened' },
            reveals_exit: { direction: goalDirName, destination: goal.id },
            hint: 'use ladder'
        },
        {
            pattern: '\\b(use|unroll|lower|place|attach|fasten)\\b.*\\b(ladder|rope ladder)\\b',
            conditions: ['has:ladder', 'item:ladder:fastened'],
            response: 'The rope ladder is already fastened and waiting.',
            hint: 'use ladder'
        },
        {
            pattern: '\\b(use|unroll|lower|place|attach|fasten)\\b.*\\b(ladder|rope ladder)\\b',
            response: 'You have nothing to climb down with.',
            hint: 'use ladder'
        },
        {
            pattern: `^\\s*(go\\s+|climb\\s+|head\\s+)?(${goalDirLetter}|${goalDirName})\\b`,
            conditions: ['item:ladder:unused'],
            response: 'The drop is far too steep. You need to fasten something to climb down with first.',
            hint: goalDirName
        }
    ];

    // --- 5. Assemble the world object. ---
    const places = {};
    for (const room of rooms) {
        places[room.id] = {
            name: room.name,
            desc: room.desc,
            ...(room.descVariants ? { descVariants: room.descVariants } : {}),
            items: room.items || [],
            exits: room.exits
        };
    }
    places[goal.id] = {
        name: goal.name,
        desc: goal.desc,
        items: [],
        exits: goal.exits
    };

    const synonyms = {
        take: ['take', 'get', 'grab', 'pick', 'pick up', 'collect'],
        drop: ['drop', 'put down', 'discard'],
        look: ['look', 'look at', 'examine', 'inspect', 'view', 'check', 'l'],
        survey: ['survey', 'look around', 'around', 'exits', 'where'],
        describe: ['describe'],
        light: ['light', 'ignite', 'extinguish'],
        use: ['use', 'open', 'unlock', 'unroll', 'lower', 'place', 'attach',
            'fasten', 'search', 'turn', 'switch'],
        inventory: ['inventory', 'inv', 'i', 'items', 'bag', 'belongings'],
        move: ['go', 'walk', 'move', 'head', 'run', 'climb', 'enter'],
        help: ['help', 'h', '?'],
        quit: ['quit', 'q', 'exit', 'end'],
        north: ['n'], south: ['s'], east: ['e'], west: ['w'],
        up: ['u', 'upward', 'upstairs', 'ascend'],
        down: ['d', 'downward', 'downstairs', 'descend'],
        lantern: ['lantern', 'lamp'],
        ladder: ['ladder', 'rope ladder']
    };
    for (const flavor of FLAVOR_ITEMS) {
        if (items[flavor.id]) synonyms[flavor.id] = [flavor.id];
    }

    const meta = {
        lang: 'en',
        title,
        seed,
        start: start.id,
        goal: goal.id
    };

    return { places, items, synonyms, actions, meta };
}

module.exports = { generateWorld, ROOM_TEMPLATES };
