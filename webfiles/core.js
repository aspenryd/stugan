const GameCore = (() => {
    // These are module-level variables, set when processCommand is called.
    // This makes the core reusable for different sets of game data.
    let DATA = {};
    let SYNON_MAP = {};

    // Creates a fresh state object for a new game.
    const createInitialState = () => ({
        loc: 'övergivet_torp',
        health: 100,
        inventory: [],
        visited: [], // JSON-friendly array
        flags: {},
        roomStates: {}
    });

    // Deep-clones the state to prevent mutations from leaking between turns.
    // Special handling for `visited` which is a Set, but stringifies to an array.
    const cloneState = (state) => {
        const newState = JSON.parse(JSON.stringify(state));
        newState.visited = new Set(state.visited);
        return newState;
    };

    // Pre-builds a map from any synonym to its canonical term.
    const buildSynonymMap = (synonyms) => {
        SYNON_MAP = {};
        for (const [canon, list] of Object.entries(synonyms)) {
            (Array.isArray(list) ? list : [list]).forEach(s => SYNON_MAP[s] = canon);
            SYNON_MAP[canon] = canon;
        }
        // Hard-coded movement synonyms for convenience
        SYNON_MAP['n'] = 'norr';
        SYNON_MAP['s'] = 'söder';
        SYNON_MAP['e'] = 'öster';
        SYNON_MAP['w'] = 'väster';
        SYNON_MAP['ö'] = 'öster';
        SYNON_MAP['v'] = 'väster';
        SYNON_MAP['u'] = 'upp';
        SYNON_MAP['d'] = 'ned';
        const directions = ['norr', 'söder', 'öster', 'väster', 'upp', 'ned'];
        for (const dir of directions) {
            if (!SYNON_MAP[dir]) SYNON_MAP[dir] = dir;
        }
        return SYNON_MAP;
    };

    // Cleans and normalizes user input string.
    const normalize = s => (s || '').toLowerCase().replace(/[^\wåäö\s]/gi, '').trim();

    // --- Condition-checking helper functions ---
    const hasItem = (state, id) => state.inventory.includes(id);
    const isItemState = (state, id, st) => DATA.items[id]?.state === st;

    const matchesConditions = (state, cs) => !cs || cs.every(cond => {
        if (cond.startsWith('item:')) {
            const [_, id, st] = cond.split(':');
            return isItemState(state, id, st);
        } else if (cond.startsWith('has:')) {
            return hasItem(state, cond.split(':')[1]);
        } else if (cond.startsWith('not_has:')) {
            return !hasItem(state, cond.split(':')[1]);
        } else if (cond.startsWith('item_gt:')) {
            const [_, itemId, prop, valueStr] = cond.split(':');
            const value = parseInt(valueStr, 10);
            return hasItem(state, itemId) && DATA.items[itemId] && DATA.items[itemId][prop] > value;
        } else if (cond.startsWith('item_eq:')) {
            const [_, itemId, prop, valueStr] = cond.split(':');
            const item = DATA.items[itemId];
            if (hasItem(state, itemId) && item && item[prop] !== undefined) {
                if (typeof item[prop] === 'number') return item[prop] === parseInt(valueStr, 10);
                return item[prop] === valueStr;
            }
            return false;
        } else if (cond.startsWith('has_flag:')) {
            return !!state.flags[cond.substring('has_flag:'.length)];
        } else if (cond.startsWith('not_has_flag:')) {
            return !state.flags[cond.substring('not_has_flag:'.length)];
        } else if (cond.startsWith('at_location:')) {
            return state.loc === cond.substring('at_location:'.length);
        } else if (cond.startsWith('room_has_item_state:')) {
            const [_, itemId, itemState] = cond.split(':');
            const place = DATA.places[state.loc];
            return place.items.includes(itemId) && DATA.items[itemId] && DATA.items[itemId].state === itemState;
        } else if (cond.startsWith('room_feature_true:')) {
            const [_, roomName, featureName] = cond.split(':');
            return state.roomStates[roomName] && state.roomStates[roomName][featureName] === true;
        } else if (cond.startsWith('player_knows_lösenord:')) {
            return !!state.flags['known_password_' + cond.substring('player_knows_lösenord:'.length)];
        }
        return false;
    });

    // --- Core Command Implementations ---
    // Each returns { newState, output, ...otherFlags }
    const doLook = (state, rawInput = '') => {
        const output = [];
        const newState = cloneState(state);

        const normalizedInput = normalize(rawInput);
        const inputWords = normalizedInput.split(/\s+/);
        const commandVerb = (rawInput === 'beskriv') ? 'describe' : (SYNON_MAP[inputWords[0]] || inputWords[0]);
        const isExplicitlyDescribingLocation = commandVerb === 'describe';

        if (!isExplicitlyDescribingLocation && commandVerb === 'look' && inputWords.length > 1) {
            const targetName = inputWords.slice(1).join(' ');
            const targetItemId = SYNON_MAP[targetName];
            const currentPlace = DATA.places[newState.loc];
            if (targetItemId && DATA.items[targetItemId] && (currentPlace.items.includes(targetItemId) || newState.inventory.includes(targetItemId))) {
                const item = DATA.items[targetItemId];
                output.push(item.desc);
                if (item.story && typeof item.story === 'string' && item.story.trim() !== '') {
                    output.push(item.story);
                }
                return { newState, output };
            }
        }

        const place = DATA.places[newState.loc];
        const isFirstActualVisit = !newState.visited.has(newState.loc);
        let shownSpecifics = false;

        if (isExplicitlyDescribingLocation || isFirstActualVisit) {
            if (place.ascii) { output.push(place.ascii); shownSpecifics = true; }
            if (place.longDesc) { output.push(place.longDesc); shownSpecifics = true; }
            if (!shownSpecifics) { output.push(place.desc); }
        } else {
            output.push(place.desc);
        }

        if (isFirstActualVisit) {
            newState.visited.add(newState.loc);
        }

        if (place.items.length > 0) {
            output.push('Du ser: ' + place.items.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', '));
        }
        return { newState, output };
    };

    const doSurvey = (state) => {
        const output = [];
        const place = DATA.places[state.loc];
        output.push(`Vägar: ${Object.keys(place.exits).join(', ')}`);
        if (place.items.length > 0) {
            output.push(`Här finns: ${place.items.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')}`);
        }
        return { newState: state, output };
    };

    const doTake = (state, raw) => {
        const newState = cloneState(state);
        const output = [];

        // Instead of a regex, we find the verb and the object based on synonyms.
        const takeSynonyms = DATA.synonyms.take || [];
        let objectPhrase = '';

        // Sort synonyms by length descending to match "plocka upp" before "plocka".
        // Also include the canonical verb itself in the list of possibilities.
        const sortedSynonyms = [...takeSynonyms, 'take'].sort((a, b) => b.length - a.length);

        for (const syn of sortedSynonyms) {
            if (raw.startsWith(syn + ' ')) {
                objectPhrase = raw.substring(syn.length).trim();
                break;
            }
        }

        if (!objectPhrase) {
            output.push("Vad vill du plocka upp?");
            return { newState, output };
        }

        const word = objectPhrase;
        const id = SYNON_MAP[word];
        const place = DATA.places[newState.loc];

        if (!id || !DATA.items[id]) {
            output.push(`Jag förstår inte vad "${word}" är.`);
            return { newState, output };
        }
        if (!place.items.includes(id)) {
            output.push(`${word.charAt(0).toUpperCase() + word.slice(1)} finns inte här.`);
            return { newState, output };
        }
        if (!DATA.items[id].portable) {
            output.push(`Du kan inte plocka upp ${word}.`);
            return { newState, output };
        }

        newState.inventory.push(id);
        // NOTE: This mutates the shared DATA object, which is a side-effect.
        place.items = place.items.filter(i => i !== id);
        output.push(`Du plockar upp ${word}.`);
        return { newState, output };
    };

    const doMove = (state, cmd) => {
        let newState = cloneState(state);
        const output = [];
        const place = DATA.places[newState.loc];
        const availableExits = place.exits || {};

        // 1. Check for exact match with a custom exit's synonyms first.
        // This handles multi-word commands like "klättra ner i nästet".
        for (const exitKey of Object.keys(availableExits)) {
            const synonymsForExit = DATA.synonyms[exitKey] || [exitKey];
            if (synonymsForExit.includes(cmd)) {
                newState.loc = availableExits[exitKey];
                const lookResult = doLook(newState);
                newState = lookResult.newState;
                output.push(...lookResult.output);
                return { newState, output };
            }
        }

        // 2. If no custom exit matched, parse for a standard direction within the command.
        // This handles commands like "gå norrut" or just "ner".
        const words = cmd.split(/\s+/);
        const mappedWords = words.map(w => SYNON_MAP[w]);
        const canonicalDirections = ['norr', 'söder', 'öster', 'väster', 'upp', 'ned'];

        const foundDirection = mappedWords.find(w => canonicalDirections.includes(w));

        if (foundDirection) {
            if (availableExits[foundDirection]) {
                newState.loc = availableExits[foundDirection];
                const lookResult = doLook(newState);
                newState = lookResult.newState;
                output.push(...lookResult.output);
            } else {
                output.push(`Du kan inte gå ${foundDirection} härifrån.`);
            }
            return { newState, output };
        }

        // 3. If we still haven't found anything, give a generic failure message.
        output.push('Vart vill du gå? Försök med en tydligare riktning eller beskrivning av vägen.');
        return { newState, output };
    };

    const doInventory = (state) => {
        const invDisplay = state.inventory.map(id => {
            const it = DATA.items[id];
            const pretty = id.charAt(0).toUpperCase() + id.slice(1);
            return it.state != null ? `${pretty}:${it.state}` : pretty;
        }).join(', ');
        return { newState: state, output: [`Du bär: ${invDisplay || 'inget'}`] };
    };

    const doHelp = (state) => {
        const place = DATA.places[state.loc];
        const exits = Object.keys(place.exits || {});
        const items = place.items || [];

        const output = [
            '--- Hjälp ---',
            'Skriv kommandon för att interagera med världen. Försök med enkla verb och substantiv.',
            'Exempel:',
            '  titta            - Beskriver rummet igen.',
            '  titta på <sak>   - Undersök en specifik sak.',
            '  ta <sak>         - Plocka upp en sak.',
            '  gå <riktning>    - Förflytta dig (t.ex. "gå norrut").',
            '  inventering      - Visa vad du bär på.',
            '  hjälp            - Visar denna hjälptext.',
            '  sluta            - Avslutar spelet.',
            ''
        ];

        if (exits.length > 0) {
            output.push(`Du kan se vägar som leder: ${exits.join(', ')}.`);
        }
        if (items.length > 0) {
            const itemNames = items.map(id => DATA.items[id]?.name || id.charAt(0).toUpperCase() + id.slice(1));
            output.push(`Du ser några saker här: ${itemNames.join(', ')}.`);
        } else {
            output.push('Du ser inget du kan plocka upp just nu, men prova att titta närmare på omgivningen.');
        }
        output.push('---');

        return { newState: state, output };
    };

    const doQuit = (state) => ({ newState: state, output: ['Spelet avslutat.'], shouldQuit: true });

    const handleActions = (state, raw) => {
        let newState = cloneState(state);
        const output = [];
        let handled = false;
        let shouldQuit = false;
        let moved = false;

        const placeActs = DATA.actions[newState.loc] || [];
        const globalActs = DATA.actions['*'] || [];

        // Check all applicable actions, with location-specific ones taking precedence.
        for (const a of [...placeActs, ...globalActs]) {
            if (!new RegExp(a.pattern, 'i').test(raw)) continue;
            if (!matchesConditions(newState, a.conditions)) continue;

            handled = true;
            output.push(a.response);

            // This section carefully applies all possible effects of an action.
            if (a.consume_item) newState.inventory = newState.inventory.filter(i => i !== a.consume_item);
            if (a.consume_item_if_present) a.consume_item_if_present.forEach(itemId => { newState.inventory = newState.inventory.filter(i => i !== itemId) });
            if (a.remove_items) newState.inventory = newState.inventory.filter(i => !a.remove_items.includes(i));
            if (a.add_item && !newState.inventory.includes(a.add_item)) newState.inventory.push(a.add_item);
            if (a.pickup_item && !newState.inventory.includes(a.pickup_item)) newState.inventory.push(a.pickup_item);
            if (a.set_flag) newState.flags[a.set_flag] = true;
            if (a.set_player_state) newState[a.set_player_state.key] = a.set_player_state.value;

            if (a.state_change) {
                if (a.state_change.item) {
                    const itemToChange = DATA.items[a.state_change.item];
                    if (itemToChange) {
                        if (a.state_change.state !== undefined) itemToChange.state = a.state_change.state;
                        if (a.state_change.key && a.state_change.value !== undefined) itemToChange[a.state_change.key] = a.state_change.value;
                    }
                } else if (a.state_change.room) {
                    if (!newState.roomStates[a.state_change.room]) newState.roomStates[a.state_change.room] = {};
                    newState.roomStates[a.state_change.room][a.state_change.feature] = a.state_change.value;
                } else if (a.state_change.world_event) {
                    newState.flags[a.state_change.world_event] = a.state_change.value;
                } else if (a.state_change.room_item && a.state_change.property) {
                    const placeToChange = DATA.places[a.state_change.room_item];
                    if (placeToChange) {
                        if (placeToChange[a.state_change.property] && typeof placeToChange[a.state_change.property] === 'string' && a.state_change.value_op === 'append') {
                             placeToChange[a.state_change.property] += a.state_change.value;
                        } else {
                             placeToChange[a.state_change.property] = a.state_change.value;
                        }
                    }
                }
            }

            if (a.remove_from_room) DATA.places[newState.loc].items = DATA.places[newState.loc].items.filter(i => i !== a.remove_from_room);
            if (a.reveals) a.reveals.forEach(it => { if (!DATA.places[newState.loc].items.includes(it)) DATA.places[newState.loc].items.push(it) });
            if (a.reveals_exit) {
                const place = DATA.places[newState.loc];
                if (place) {
                    if (!place.exits) place.exits = {};
                    place.exits[a.reveals_exit.direction] = a.reveals_exit.destination;
                }
            }

            if (a.go && DATA.places[a.go]) {
                newState.loc = a.go;
                moved = true;
            }

            if (a.game_ending) {
                if (a.game_ending.title) output.push(`\n--- ${a.game_ending.title} ---`);
                if (a.game_ending.message) output.push(a.game_ending.message);
                shouldQuit = true;
            }

            // If an action was matched and handled, we stop processing more actions.
            if (moved) {
                const lookResult = doLook(newState);
                newState = lookResult.newState;
                output.push(...lookResult.output);
            }
            return { handled, newState, output, shouldQuit };
        }
        return { handled: false, newState, output, shouldQuit: false };
    };

    const findVerb = (state, words) => {
        const mappedWords = words.map(w => SYNON_MAP[w]);
        const fullNormalizedCmd = words.join(' ');

        let verb = mappedWords.find(v => ['look', 'survey', 'take', 'move', 'inventory', 'light', 'help', 'quit', 'describe', 'use', 'combine'].includes(v));
        if (verb) return verb;

        if (mappedWords.some(w => ['norr', 'söder', 'öster', 'väster', 'upp', 'ned'].includes(w))) {
            return 'move';
        }

        const place = DATA.places[state.loc];
        if (place.exits) {
            for (const exitKey of Object.keys(place.exits)) {
                const synonymsForExit = DATA.synonyms[exitKey] || [exitKey];
                if (synonymsForExit.includes(fullNormalizedCmd)) return 'move';
            }
        }
        return undefined;
    };

    // The main entry point for the game logic.
    const processCommand = (state, data, input) => {
        DATA = data; // Set data context for this turn.
        let newState = cloneState(state);
        const output = [];

        if (!input.trim()) {
            return { newState, output, shouldQuit: false };
        }
        output.push(`> ${input}`);

        // First, try to match a declarative action.
        const actionResult = handleActions(newState, input);
        if (actionResult.handled) {
            // Convert Set back to array for JSON-friendly state
            actionResult.newState.visited = Array.from(actionResult.newState.visited);
            return {
                newState: actionResult.newState,
                output: [...output, ...actionResult.output],
                shouldQuit: actionResult.shouldQuit
            };
        }

        // If no action matched, parse as a verb-noun command.
        const cmd = normalize(input);
        const words = cmd.split(/\s+/);
        let commandResult;

        switch (findVerb(newState, words)) {
            case 'look': commandResult = words.includes('runt') ? doSurvey(newState) : doLook(newState, cmd); break;
            case 'describe': commandResult = doLook(newState, 'beskriv'); break;
            case 'survey': commandResult = doSurvey(newState); break;
            case 'take': commandResult = doTake(newState, cmd); break;
            case 'inventory': commandResult = doInventory(newState); break;
            case 'move': commandResult = doMove(newState, cmd); break;
            case 'help': commandResult = doHelp(newState); break;
            case 'quit': commandResult = doQuit(newState); break;
            default: commandResult = { newState, output: ['Jag förstår inte.'] }; break;
        }

        // Convert Set back to array for JSON-friendly state
        commandResult.newState.visited = Array.from(commandResult.newState.visited);
        return {
            newState: commandResult.newState,
            output: [...output, ...commandResult.output],
            shouldQuit: !!commandResult.shouldQuit
        };
    };

    // The init function sets up the initial state and performs the first "look".
    const init = (data) => {
        DATA = data; // Set data context for the game session.
        const initialState = createInitialState();
        // Perform the initial "look" to get the starting description.
        const lookResult = doLook(initialState);

        // Convert Set to array for a clean, JSON-friendly state object.
        lookResult.newState.visited = Array.from(lookResult.newState.visited);

        return {
            newState: lookResult.newState,
            output: lookResult.output
        };
    };

    // Expose public functions
    return {
        init,
        buildSynonymMap,
        processCommand
    };
})();
