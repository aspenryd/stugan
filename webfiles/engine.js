const $ = s => document.querySelector(s);

const DATA = {
    places,
    items,
    synonyms,
    actions
};
let SYNON_MAP = {};

const state = {
    loc: 'stugan',
    health: 100,
    inventory: [],
    transcript: [],
    visited: new Set()
};

const viewport = $('#viewport');
const statsBar = $('#statsBar');

const print = msg => {
    const p = document.createElement('p');
    p.textContent = msg;
    viewport.appendChild(p);
    // Use requestAnimationFrame to ensure the scroll happens after the standard layout update
    requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight;
    });
};

const inventoryDisplay = () => state.inventory.map(id => {
    const it = DATA.items[id];
    const pretty = id.charAt(0).toUpperCase() + id.slice(1);
    return it.state != null ? `${pretty}:${it.state}` : pretty;
}).join(', ');

const refreshStats = () => {
    statsBar.textContent = `Plats: ${state.loc} | Hälsa: ${state.health} | Föremål: ${inventoryDisplay() || '–'}`;
};

// Build synonym lookup
const buildSynonymMap = () => {
    SYNON_MAP = {};
    // Existing loop to populate from DATA.synonyms
    for (const [canon, list] of Object.entries(DATA.synonyms)) {
        (Array.isArray(list) ? list : [list]).forEach(s => SYNON_MAP[s] = canon);
        SYNON_MAP[canon] = canon; // Ensure canonical form maps to itself
    }

    // Add single-letter movement synonyms directly
    SYNON_MAP['n'] = 'norr';
    SYNON_MAP['s'] = 'söder';
    SYNON_MAP['e'] = 'öster';
    SYNON_MAP['w'] = 'väster';
    SYNON_MAP['ö'] = 'öster'; // Swedish specific 'Ö' for East
    SYNON_MAP['v'] = 'väster'; // Swedish specific 'V' for West
    SYNON_MAP['u'] = 'upp';
    SYNON_MAP['d'] = 'ned';

    // Also ensure that the canonical direction words still map to themselves
    // if not already covered by DATA.synonyms processing (e.g. if 'norr' isn't a key in DATA.synonyms)
    // Though the original loop's `SYNON_MAP[canon] = canon;` should handle this if directions are canonical keys.
    // Adding them explicitly here for robustness is fine.
    const directions = ['norr', 'söder', 'öster', 'väster', 'upp', 'ned'];
    for (const dir of directions) {
        if (!SYNON_MAP[dir]) {
            SYNON_MAP[dir] = dir;
        }
    }
};

// Condition checks
const hasItem = id => state.inventory.includes(id);
const isItemState = (id, st) => DATA.items[id]?.state === st;
const matchesConditions = cs => !cs || cs.every(cond => {
    if (cond.startsWith('item:')) {
        const [_, id, st] = cond.split(':');
        return isItemState(id, st);
    }
    if (cond.startsWith('has:'))
        return hasItem(cond.split(':')[1]);
    if (cond.startsWith('not_has:'))
        return !hasItem(cond.split(':')[1]);
    return false;
});

// Core commands
// Cleans user input: lowercases, strips punctuation, trims
const normalize = s => (s || '').toLowerCase().replace(/[^\wåäö\s]/gi, '').trim();

const doLook = (rawInput = '') => {
    const normalizedInput = normalize(rawInput);
    const inputWords = normalizedInput.split(/\s+/);
    // Determine the canonical verb. If 'beskriv' was passed directly by process(), it's 'describe'.
    // Otherwise, map the first word. Fallback to the word itself if not in SYNON_MAP.
    const commandVerb = (rawInput === 'beskriv') ? 'describe' : (SYNON_MAP[inputWords[0]] || inputWords[0]);

    // isExplicitlyDescribingLocation is true if the 'describe' verb is effectively used.
    const isExplicitlyDescribingLocation = commandVerb === 'describe';

    // --- Part 1: Try to look at a specific item ---
    // This section executes if the command is 'look' (not 'describe') and has a target.
    if (!isExplicitlyDescribingLocation && commandVerb === 'look' && inputWords.length > 1) {
        const targetName = inputWords.slice(1).join(' '); // Use all words after 'look' as potential item name
        const targetItemId = SYNON_MAP[targetName]; // Resolve if targetName is a synonym for an item ID
        const currentPlace = DATA.places[state.loc];

        // Check if the resolved targetItemId is a valid item and present in the location or inventory
        if (targetItemId && DATA.items[targetItemId] && (currentPlace.items.includes(targetItemId) || state.inventory.includes(targetItemId))) {
            print(DATA.items[targetItemId].desc);
            // Standard IF behavior: after describing a specific item, the action is complete.
            return true;
        }
        // If "look <something>" was typed, but <something> isn't a recognized/present item,
        // we fall through to describing the location itself. This matches original behavior.
    }

    // --- Part 2: Describe the location ---
    const place = DATA.places[state.loc];
    const isFirstActualVisit = !state.visited.has(state.loc); // True only if state.loc is not in state.visited set

    let shownSpecifics = false; // Helper flag to track if ASCII or longDesc was shown

    if (isExplicitlyDescribingLocation) {
        // Always show long description and/or ASCII art for "describe" commands
        if (place.ascii) { print(place.ascii); shownSpecifics = true; }
        if (place.longDesc) { print(place.longDesc); shownSpecifics = true; }
        // If "describe" was used but the place has no ascii or longDesc, show the short description.
        if (!shownSpecifics) { print(place.desc); }
    } else if (isFirstActualVisit) {
        // For the first visit to a location (and not an explicit "describe" command)
        if (place.ascii) { print(place.ascii); shownSpecifics = true; }
        if (place.longDesc) { print(place.longDesc); shownSpecifics = true; }
        // If it's a first visit and the place has no ascii or longDesc, show the short description.
        if (!shownSpecifics) { print(place.desc); }
    } else {
        // For subsequent visits (not a first visit and not an explicit "describe")
        print(place.desc);
    }

    // Add location to state.visited if this was its first actual visit.
    // This ensures it's marked visited regardless of whether long/ascii or short desc was shown.
    if (isFirstActualVisit) {
        state.visited.add(state.loc);
    }

    // --- Part 3: List items in the location ---
    // This runs unless the function returned early after describing a specific item.
    if (place.items.length) {
        print('Du ser: ' + place.items.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', '));
    }
    return true;
};
const doSurvey = () => {
    const place = DATA.places[state.loc];
    print(`Vägar: ${Object.keys(place.exits).join(', ')}`);
    if (place.items.length) {
        print(`Här finns: ${place.items.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')}`);
    }
};

const doTake = raw => {
    // match Swedish verbs “ta” eller “plocka upp”
    const m = raw.match(/^(?:ta|plocka upp)\s+(.+)$/i);
    if (!m) {
        print("Vad vill du plocka upp?");
        return false;
    }
    const word = m[1].trim();
    const id = SYNON_MAP[word];
    const place = DATA.places[state.loc];

    if (!id) {
        print(`Jag förstår inte vad "${word}" är.`);
        return false;
    }
    if (!place.items.includes(id)) {
        print(`${word.charAt(0).toUpperCase() + word.slice(1)} finns inte här.`);
        return false;
    }
    if (!DATA.items[id].portable) {
        print(`Du kan inte plocka upp ${word}.`);
        return false;
    }

    // add to inventory and remove from place
    state.inventory.push(id);
    place.items = place.items.filter(i => i !== id);
    print(`Du plockar upp ${word}.`);
    refreshStats();
    return true;
};

const doMove = cmd => { // cmd is the raw normalized input, e.g., "gå norr", "norr", "n"
    const words = cmd.split(/\s+/);
    let foundDir = null;

    // Iterate over words to find a recognized direction
    for (const word of words) {
        // Check if the word itself is a direction (e.g. "norr") or a synonym ("n")
        // SYNON_MAP should provide the canonical direction name (e.g. SYNON_MAP['n'] -> 'norr')
        const canonicalWord = SYNON_MAP[word];
        if (['norr', 'söder', 'öster', 'väster', 'upp', 'ned'].includes(canonicalWord)) {
            foundDir = canonicalWord;
            break;
        }
    }

    // Fallback for cases like "gå norrut" where "norr" is part of the word,
    // or if the synonym mapping isn't perfect for all command structures.
    // This ensures existing behavior like "gå norr" still works if "norr" isn't a standalone word in `words` that maps directly.
    if (!foundDir) {
        // This will catch 'norr' in 'gå norr', assuming 'gå' isn't a mapped direction.
        // It also covers cases where SYNON_MAP might not yet be populated with single letters,
        // though the next plan step is to update SYNON_MAP.
        foundDir = ['norr', 'söder', 'öster', 'väster', 'upp', 'ned'].find(d => cmd.includes(d));
    }

    if (!foundDir) {
        print('Vart vill du gå?');
        return;
    }

    const place = DATA.places[state.loc];
    const dest = place.exits[foundDir]; // Use the resolved direction

    if (!dest) {
        print(`Du kan inte gå ${foundDir}.`);
        return;
    }
    state.loc = dest;
    doLook(); // doLook will handle visited status correctly
    refreshStats();
};

const doInventory = () => print(`Du bär: ${inventoryDisplay() || 'inget'}`);
const doHelp = () => print('Kommandon: titta, ta, gå, inventering, tänd/släck ficklampa, hjälp, sluta');
const doQuit = () => {
    print('Spelet avslutat.');
    $('#commandInput').disabled = true;
};

// Action dispatcher
const handleActions = raw => {
    const placeActs = DATA.actions[state.loc] || [];
    const globalActs = DATA.actions['*'] || [];
    for (const a of [...globalActs, ...placeActs]) {
        if (!new RegExp(a.pattern, 'i').test(raw))
            continue;
        if (!matchesConditions(a.conditions))
            continue;
        print(a.response);
        if (a.state_change) {
            const {
                item,
                state: ns
            } = a.state_change;
            DATA.items[item].state = ns;
            refreshStats();
        }
        if (a.reveals) {
            a.reveals.forEach(it => {
                if (!DATA.places[state.loc].items.includes(it))
                    DATA.places[state.loc].items.push(it);
            });
        }
        if (a.unlock_exits) {
            Object.entries(a.unlock_exits).forEach(([dir, room]) => {
                DATA.places[state.loc].exits[dir] = room;
            });
        }
        return true;
    }
    return false;
};

const findVerb = words => {
    // Map all words to their canonical forms via SYNON_MAP.
    // SYNON_MAP should already be populated with single letters mapping to directions (e.g., SYNON_MAP['n'] = 'norr')
    // and action words to canonical verbs (e.g., SYNON_MAP['gå'] = 'move').
    const mappedWords = words.map(w => SYNON_MAP[w]);

    // First, try to find a primary verb (look, take, move, etc.)
    let verb = mappedWords.find(v => ['look', 'survey', 'take', 'move', 'inventory', 'light', 'help', 'quit', 'describe'].includes(v));
    if (verb) {
        return verb;
    }

    // If no direct verb was found, check if any of the (mapped) words is a known direction.
    // If so, interpret this as a 'move' command.
    // This allows inputs like "n" (mapped to "norr") to be treated as "move".
    const isDirection = mappedWords.some(mappedWord => ['norr', 'söder', 'öster', 'väster', 'upp', 'ned'].includes(mappedWord));
    if (isDirection) {
        return 'move';
    }

    return undefined; // No recognized verb or direction found
};
const process = input => {

    if (!input.trim())
        return;
    print(`> ${input}`);
    if (handleActions(input))
        return;
    const cmd = normalize(input);
    const words = cmd.split(/\s+/);
    switch (findVerb(words)) {
        case 'look':
            words.includes('runt') ? doSurvey() : doLook(cmd);
            break;
        case 'describe':
            doLook('beskriv');
            break;
        case 'survey':
            doSurvey();
            break;
        case 'take':
            doTake(cmd);
            break;
        case 'light':
            handleActions(input);
            break;
        case 'inventory':
            doInventory();
            break;
        case 'move':
            doMove(cmd);
            break;
        case 'help':
            doHelp();
            break;
        case 'quit':
            doQuit();
            break;
        default:
            print('Jag förstår inte.');
    }
};

// Boot
const startGame = () => {
    buildSynonymMap();
    $('#landing').style.display = 'none';
    $('#gameUI').style.display = 'flex';
    doLook();
    refreshStats();
    $('#commandInput').focus();
};

let isProcessing = false;
document.querySelector('#startBtn').onclick = startGame;
document.querySelector('#commandForm').onsubmit = e => {
    e.preventDefault();
    if (isProcessing) return; // Prevent double submits
    const input = $('#commandInput');
    const val = input.value;
    if (!val.trim()) return;

    isProcessing = true;
    input.value = '';
    process(val);
    isProcessing = false;
};
