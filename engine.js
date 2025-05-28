const $ = s => document.querySelector(s);

const DATA = {
    places,
    items,
    synonyms,
    actions
};
let SYNON_MAP = {};

const state = {
    loc: 'övergivet_torp',
    health: 100,
    inventory: [],
    transcript: [],
    visited: new Set(),
    flags: {},
    roomStates: {}
};

const viewport = $('#viewport');
const statsBar = $('#statsBar');

const print = msg => {
    const p = document.createElement('p');
    p.textContent = msg;
    viewport.appendChild(p);
    viewport.scrollTop = viewport.scrollHeight;
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
    } else if (cond.startsWith('has:')) {
        return hasItem(cond.split(':')[1]);
    } else if (cond.startsWith('not_has:')) {
        return !hasItem(cond.split(':')[1]);
    } else if (cond.startsWith('item_gt:')) {
        const [_, itemId, prop, valueStr] = cond.split(':');
        const value = parseInt(valueStr, 10);
        return hasItem(itemId) && DATA.items[itemId] && DATA.items[itemId][prop] > value;
    } else if (cond.startsWith('item_eq:')) {
        const [_, itemId, prop, valueStr] = cond.split(':');
        const item = DATA.items[itemId];
        if (hasItem(itemId) && item && item[prop] !== undefined) {
            if (typeof item[prop] === 'number') {
                return item[prop] === parseInt(valueStr, 10);
            }
            return item[prop] === valueStr;
        }
        return false;
    } else if (cond.startsWith('has_flag:')) {
        const flagName = cond.substring('has_flag:'.length);
        return !!state.flags[flagName];
    } else if (cond.startsWith('not_has_flag:')) {
        const flagName = cond.substring('not_has_flag:'.length);
        return !state.flags[flagName];
    } else if (cond.startsWith('at_location:')) {
        const locId = cond.substring('at_location:'.length);
        return state.loc === locId;
    } else if (cond.startsWith('room_has_item_state:')) {
        const [_, itemId, itemState] = cond.split(':');
        const place = DATA.places[state.loc];
        return place.items.includes(itemId) && DATA.items[itemId] && DATA.items[itemId].state === itemState;
    } else if (cond.startsWith('room_feature_true:')) {
        const parts = cond.split(':'); 
        if (parts.length === 3) {
            const roomName = parts[1];
            const featureName = parts[2];
            return state.roomStates[roomName] && state.roomStates[roomName][featureName] === true;
        }
        return false; 
    } else if (cond.startsWith('player_knows_lösenord:')) {
        const passwordId = cond.substring('player_knows_lösenord:'.length);
        return !!state.flags['known_password_' + passwordId];
    }
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
            const item = DATA.items[targetItemId];
            print(item.desc);
            if (item.story && typeof item.story === 'string' && item.story.trim() !== '') {
                print(item.story); 
            }
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

const doMove = cmd => { // cmd is the raw normalized input, e.g., "gå över sjön", "klättra ner i nästet"
    const place = DATA.places[state.loc];
    if (!place.exits || Object.keys(place.exits).length === 0) {
        print('Det finns inga uppenbara vägar härifrån.');
        return;
    }

    const availableExitKeys = Object.keys(place.exits);
    let chosenDirection = null;

    // Iterate through each available exit key for the current room
    for (const exitKey of availableExitKeys) {
        // Get the list of synonyms for this exitKey directly from DATA.synonyms
        const synonymsForExit = DATA.synonyms[exitKey] || [exitKey]; // Fallback to the key itself

        if (synonymsForExit.includes(cmd)) {
            chosenDirection = exitKey;
            break;
        }
    }

    if (chosenDirection) {
        const destination = place.exits[chosenDirection];
        // Future: Add condition checks for exits here if exits can have conditions
        state.loc = destination;
        doLook(); // doLook will handle visited status correctly
        refreshStats();
    } else {
        // Check if the input might have been a standard direction that's just not available.
        // SYNON_MAP[cmd] could map "gå norr" to "norr" or "n" to "norr".
        // Or cmd itself could be "norr" if user typed that.
        const canonicalInputAttempt = SYNON_MAP[cmd] || cmd; 

        if (['norr', 'söder', 'öster', 'väster', 'upp', 'ned'].includes(canonicalInputAttempt) && !availableExitKeys.includes(canonicalInputAttempt) ) {
             print(`Du kan inte gå ${canonicalInputAttempt} härifrån.`);
        } else {
            // More generic message if it's not a recognized standard direction that's unavailable.
            print('Vart vill du gå? Försök med en tydligare riktning eller beskrivning av vägen.');
        }
    }
};

const doInventory = () => print(`Du bär: ${inventoryDisplay() || 'inget'}`);
const doHelp = () => print('Kommandon: titta, ta, gå, inventering, tänd/släck lykta, hjälp, sluta');
const doQuit = () => {
    print('Spelet avslutat.');
    $('#commandInput').disabled = true;
};

// Action dispatcher
const handleActions = raw => {
    const placeActs = DATA.actions[state.loc] || [];
    const globalActs = DATA.actions['*'] || [];
    for (const a of[...globalActs, ...placeActs]) {
        if (!new RegExp(a.pattern, 'i').test(raw))
            continue;
        if (!matchesConditions(a.conditions))
            continue;
        print(a.response);
        if (a.state_change) {
            // Start of new effects logic, ordered as planned
            let stateChanged = false; // Flag to track if refreshStats is needed

            // 1. Item removals
            if (a.consume_item) {
                if (state.inventory.includes(a.consume_item)) {
                    state.inventory = state.inventory.filter(i => i !== a.consume_item);
                    stateChanged = true;
                }
            }
            if (a.consume_item_if_present) {
                a.consume_item_if_present.forEach(itemId => {
                    if (state.inventory.includes(itemId)) {
                        state.inventory = state.inventory.filter(i => i !== itemId);
                        stateChanged = true;
                    }
                });
            }
            if (a.remove_items) {
                state.inventory = state.inventory.filter(i => !a.remove_items.includes(i));
                stateChanged = true;
            }

            // 2. Item additions
            if (a.add_item) {
                if (!state.inventory.includes(a.add_item)) {
                    state.inventory.push(a.add_item);
                    stateChanged = true;
                }
            }
            if (a.pickup_item) {
                if (!state.inventory.includes(a.pickup_item)) {
                    state.inventory.push(a.pickup_item);
                    stateChanged = true;
                }
            }

            // 3. State changes (item, player, room/world, flags)
            if (a.state_change) {
                if (a.state_change.item) { // Item state change
                    const itemToChange = DATA.items[a.state_change.item];
                    if (itemToChange) {
                        if (a.state_change.state !== undefined) { // old style for item.state
                            itemToChange.state = a.state_change.state;
                            stateChanged = true;
                        }
                        if (a.state_change.key && a.state_change.value !== undefined) { // new style for any property
                            itemToChange[a.state_change.key] = a.state_change.value;
                            stateChanged = true;
                        }
                    }
                } else if (a.state_change.room) { // Room feature state change
                    const roomName = a.state_change.room;
                    if (!state.roomStates[roomName]) {
                        state.roomStates[roomName] = {};
                    }
                    state.roomStates[roomName][a.state_change.feature] = a.state_change.value;
                    // stateChanged might not be needed if roomStates don't affect statsBar
                } else if (a.state_change.world_event) { // Global flag / world event
                    state.flags[a.state_change.world_event] = a.state_change.value;
                    // stateChanged might not be needed if flags don't affect statsBar directly
                } else if (a.state_change.room_item && a.state_change.property) { // Modifying a place's property (e.g., description_suffix)
                    const placeToChange = DATA.places[a.state_change.room_item];
                    if (placeToChange) {
                        if (placeToChange[a.state_change.property] && typeof placeToChange[a.state_change.property] === 'string' && a.state_change.value_op === 'append') {
                             placeToChange[a.state_change.property] += a.state_change.value;
                        } else {
                             placeToChange[a.state_change.property] = a.state_change.value;
                        }
                        // This modifies DATA, not state directly affecting statsBar, so stateChanged might be false
                    }
                }
            }

            if (a.set_player_state) { // Player state change (e.g. health, custom attributes)
                state[a.set_player_state.key] = a.set_player_state.value;
                if (a.set_player_state.key === 'health') stateChanged = true; // Assuming health is in stats
                // Duration not handled
            }
            
            if (a.set_flag){ // for "set_flag": "flag_name"
                state.flags[a.set_flag] = true;
                // stateChanged might not be needed if flags don't affect statsBar directly
            }

            // 4. Removals from room
            if (a.remove_from_room) {
                const place = DATA.places[state.loc];
                if (place && place.items) {
                    place.items = place.items.filter(i => i !== a.remove_from_room);
                    // This modifies DATA.places, not directly state affecting statsBar unless items listed there.
                    // doLook() will show changes if called.
                }
            }

            // 5. Item reveals (original `a.reveals` for items in room)
            if (a.reveals) {
                a.reveals.forEach(it => {
                    if (!DATA.places[state.loc].items.includes(it)) {
                        DATA.places[state.loc].items.push(it);
                        // Modifies DATA.places. doLook() will show.
                    }
                });
            }

            // 6. Exit reveals
            if (a.reveals_exit) {
                const place = DATA.places[state.loc];
                if (place) {
                    if (!place.exits) {
                        place.exits = {};
                    }
                    place.exits[a.reveals_exit.direction] = a.reveals_exit.destination;
                    // Modifies DATA.places. doSurvey() would show this.
                }
            }
            
            // 7. Handle `go` (forced movement)
            let moved = false;
            if (a.go) {
                if (DATA.places[a.go]) { // Check if destination exists
                    state.loc = a.go;
                    moved = true;
                    stateChanged = true; // Location change affects stats bar
                } else {
                    // Optionally print an error if destination in 'go' is invalid
                    // print(`Fel: Ogiltig destination specificerad av 'go': ${a.go}`); 
                }
            }

            // 8. Call refreshStats() if needed, and doLook() if moved
            if (moved) {
                doLook(); // Describe the new location (handles visited status)
            }
            if (stateChanged || moved) { // If inventory, health, or location changed (moved implies loc changed)
                refreshStats();
            }


            // 9. Handle game ending
            if (a.game_ending) {
                if (a.game_ending.title) print(`\n--- ${a.game_ending.title} ---`);
                if (a.game_ending.message) print(a.game_ending.message);
                $('#commandInput').disabled = true;
                // After a game ending, no further actions or default processing should occur.
                return true; // Stops processing further actions in the list and command processing.
            }
            
            return true; // Action handled successfully
        }
    }
    return false; // No action matched
};

const findVerb = words => {
    // words is an array of normalized words from user input
    const mappedWords = words.map(w => SYNON_MAP[w]); 
    const fullNormalizedCmd = words.join(' '); 

    // 1. Check for primary action verbs (look, take, etc.)
    // SYNON_MAP maps individual synonym words to their canonical verb.
    let verb = mappedWords.find(v => ['look', 'survey', 'take', 'move', 'inventory', 'light', 'help', 'quit', 'describe', 'use', 'combine'].includes(v));
    if (verb) {
        // If 'move' is identified from a single generic word like 'gå', 
        // it's crucial to let doMove try to match the fullNormalizedCmd against custom exits first.
        // So, we return 'move', and doMove will determine if it's a custom or standard directional move.
        if (verb === 'move') {
            return 'move'; 
        }
        return verb; // For non-'move' verbs, return immediately.
    }
    
    // 2. Check if any *individual word* is a standard direction (n, s, norr, söder etc.)
    // This covers cases like "n", or "gå norr" where "norr" is picked up.
    const isStandardDirectionWord = mappedWords.some(mappedWord => ['norr', 'söder', 'öster', 'väster', 'upp', 'ned'].includes(mappedWord));
    if (isStandardDirectionWord) {
        return 'move';
    }

    // 3. Check if the *full normalized command string* matches a synonym for any available custom exit.
    // This allows "klättra ner i nästet" (if it's a synonym for an exit key) to be recognized as a 'move' command.
    const place = DATA.places[state.loc];
    if (place.exits) { 
        const availableExitKeys = Object.keys(place.exits);
        for (const exitKey of availableExitKeys) {
            // Get synonyms directly from DATA.synonyms using the actual exit key
            const synonymsForExit = DATA.synonyms[exitKey] || [exitKey]; 
            if (synonymsForExit.includes(fullNormalizedCmd)) {
                return 'move'; 
            }
        }
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

document.querySelector('#startBtn').onclick = startGame;
document.querySelector('#commandForm').onsubmit = e => {
    e.preventDefault();
    process($('#commandInput').value);
    $('#commandInput').value = '';
};
