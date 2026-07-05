const GameCore = (() => {
    // Module-level context, set on init/processCommand so the core is reusable
    // for any world data (and any language).
    let DATA = {};
    let SYNON_MAP = {};

    // Canonical direction tokens. These are internal ids: place exits use them,
    // and localized words map onto them via the synonyms table. Display names
    // are localized through strings.directionNames.
    const DIRECTIONS = ['north', 'south', 'east', 'west', 'up', 'down'];
    const VERBS = ['look', 'survey', 'describe', 'take', 'drop', 'move',
        'inventory', 'light', 'use', 'help', 'quit'];

    // Built-in English strings, used as fallback when the world ships no
    // strings table (or a table missing some key).
    const DEFAULT_STRINGS = {
        youSee: 'You see: {items}',
        paths: 'Paths lead: {exits}',
        hereYouFind: 'Here you find: {items}',
        whatTake: 'What do you want to pick up?',
        unknownThing: 'I don\'t know what "{word}" is.',
        notHere: 'There is no {word} here.',
        cantTake: 'You can\'t pick up the {word}.',
        youTake: 'You pick up the {word}.',
        whatDrop: 'What do you want to drop?',
        dontHave: 'You are not carrying any {word}.',
        youDrop: 'You put down the {word}.',
        cantGo: 'You can\'t go {dir} from here.',
        whereGo: 'Where do you want to go? Try a direction such as north, south, east, west, up or down.',
        youCarry: 'You are carrying: {inv}',
        nothing: 'nothing',
        cantDoThat: 'That doesn\'t work here.',
        lightWhat: 'What do you want to turn on or off?',
        quitMessage: 'Game over. Thanks for playing!',
        dontUnderstand: 'I don\'t understand. Type "help" for a list of commands.',
        victory: '*** Congratulations - you reached the goal and won the game! ***',
        helpLines: ['--- Help ---', 'Type simple verb + noun commands, e.g. "take rope", "go north", "look around".', ''],
        helpExits: 'You can see paths leading: {exits}.',
        helpItems: 'You notice a few things here: {items}.',
        helpNoItems: 'Nothing here can be picked up right now, but try looking closer at your surroundings.',
        statLocation: 'Location',
        statHealth: 'Health',
        statItems: 'Items',
        fillerWords: ['at', 'the', 'a', 'an', 'on', 'in', 'to'],
        directionNames: { north: 'north', south: 'south', east: 'east', west: 'west', up: 'up', down: 'down' }
    };

    const lang = () => (DATA.meta && DATA.meta.lang) || 'en';
    const t = key => {
        const table = (DATA.strings && DATA.strings[lang()]) || {};
        return table[key] !== undefined ? table[key] : DEFAULT_STRINGS[key];
    };
    const fmt = (template, params) =>
        String(template).replace(/\{(\w+)\}/g, (m, k) => (params && params[k] !== undefined) ? params[k] : m);
    const tf = (key, params) => fmt(t(key), params);

    const dirName = dir => (t('directionNames') || {})[dir] || dir;
    const itemName = id => (DATA.items[id] && DATA.items[id].name) || (id.charAt(0).toUpperCase() + id.slice(1));
    const listItems = ids => ids.map(itemName).join(', ');

    // Creates a fresh state object for a new game. JSON-friendly on purpose.
    const createInitialState = () => ({
        loc: (DATA.meta && DATA.meta.start) || Object.keys(DATA.places)[0],
        health: 100,
        inventory: [],
        visited: [],
        flags: {},
        roomStates: {}
    });

    // Deep-clones the state to prevent mutations from leaking between turns.
    // `visited` is used as a Set internally but serialized as an array.
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
        // Canonical directions always resolve to themselves.
        for (const dir of DIRECTIONS) {
            if (!SYNON_MAP[dir]) SYNON_MAP[dir] = dir;
        }
        return SYNON_MAP;
    };

    // Cleans and normalizes user input. Keeps letters common in European
    // languages so localized worlds parse correctly.
    const normalize = s => (s || '').toLowerCase().replace(/[^\wåäöæøéèüß\s]/gi, '').trim();

    // Removes language filler words ("at", "the", ...) from a word list.
    const stripFillers = words => {
        const fillers = t('fillerWords') || [];
        return words.filter(w => !fillers.includes(w));
    };

    // Resolves a (possibly multi-word) phrase to an item id, ignoring fillers.
    const resolveItemPhrase = phrase => {
        const words = stripFillers(normalize(phrase).split(/\s+/).filter(Boolean));
        if (!words.length) return undefined;
        const joined = words.join(' ');
        return SYNON_MAP[joined] || SYNON_MAP[words[words.length - 1]];
    };

    // --- Condition-checking helper functions ---
    const hasItem = (state, id) => state.inventory.includes(id);
    const isItemState = (state, id, st) => DATA.items[id] && DATA.items[id].state === st;

    const matchesConditions = (state, cs) => !cs || cs.every(cond => {
        if (cond.startsWith('item:')) {
            const [, id, st] = cond.split(':');
            return isItemState(state, id, st);
        } else if (cond.startsWith('has:')) {
            return hasItem(state, cond.split(':')[1]);
        } else if (cond.startsWith('not_has:')) {
            return !hasItem(state, cond.split(':')[1]);
        } else if (cond.startsWith('has_flag:')) {
            return !!state.flags[cond.substring('has_flag:'.length)];
        } else if (cond.startsWith('not_has_flag:')) {
            return !state.flags[cond.substring('not_has_flag:'.length)];
        } else if (cond.startsWith('at_location:')) {
            return state.loc === cond.substring('at_location:'.length);
        }
        return false;
    });

    // A place's description can vary with game state: the first descVariant
    // whose conditions hold wins, otherwise the default desc is used.
    const placeDesc = (place, state) => {
        for (const v of place.descVariants || []) {
            if (matchesConditions(state, v.conditions)) return v.desc;
        }
        return place.desc;
    };

    // --- Core command implementations ---
    // Each returns { newState, output, ...flags }
    const doLook = (state, rawInput = '', opts = {}) => {
        const output = [];
        const newState = cloneState(state);

        const inputWords = normalize(rawInput).split(/\s+/).filter(Boolean);
        const isDescribe = !!opts.describe;

        // "look at <thing>" - describe a specific item in the room or inventory.
        if (!isDescribe && inputWords.length > 1) {
            const targetItemId = resolveItemPhrase(inputWords.slice(1).join(' '));
            const currentPlace = DATA.places[newState.loc];
            if (targetItemId && DATA.items[targetItemId] &&
                (currentPlace.items.includes(targetItemId) || newState.inventory.includes(targetItemId))) {
                const item = DATA.items[targetItemId];
                output.push(item.desc);
                if (item.story && String(item.story).trim() !== '') {
                    output.push(item.story);
                }
                return { newState, output };
            }
        }

        const place = DATA.places[newState.loc];
        const isFirstActualVisit = !newState.visited.has(newState.loc);
        let shownSpecifics = false;

        if (isDescribe || isFirstActualVisit) {
            if (place.ascii) { output.push(place.ascii); shownSpecifics = true; }
            if (place.longDesc) { output.push(place.longDesc); shownSpecifics = true; }
            if (!shownSpecifics) { output.push(placeDesc(place, newState)); }
        } else {
            output.push(placeDesc(place, newState));
        }

        if (isFirstActualVisit) {
            newState.visited.add(newState.loc);
        }

        if (place.items.length > 0) {
            output.push(tf('youSee', { items: listItems(place.items) }));
        }
        return { newState, output };
    };

    const doSurvey = (state) => {
        const output = [];
        const place = DATA.places[state.loc];
        const exitNames = Object.keys(place.exits || {}).map(dirName);
        output.push(tf('paths', { exits: exitNames.join(', ') }));
        if (place.items.length > 0) {
            output.push(tf('hereYouFind', { items: listItems(place.items) }));
        }
        return { newState: state, output };
    };

    // Strips a known verb synonym from the start of the command and returns the rest.
    const objectPhraseFor = (verb, raw) => {
        const verbSynonyms = [...(DATA.synonyms[verb] || []), verb]
            .sort((a, b) => b.length - a.length);
        for (const syn of verbSynonyms) {
            if (raw === syn) return '';
            if (raw.startsWith(syn + ' ')) return raw.substring(syn.length).trim();
        }
        return '';
    };

    const doTake = (state, raw) => {
        const newState = cloneState(state);
        const output = [];

        const objectPhrase = objectPhraseFor('take', raw);
        if (!objectPhrase) {
            output.push(t('whatTake'));
            return { newState, output };
        }

        const word = stripFillers(objectPhrase.split(/\s+/)).join(' ') || objectPhrase;
        const id = resolveItemPhrase(objectPhrase);
        const place = DATA.places[newState.loc];

        if (!id || !DATA.items[id]) {
            output.push(tf('unknownThing', { word }));
            return { newState, output };
        }
        if (!place.items.includes(id)) {
            output.push(tf('notHere', { word }));
            return { newState, output };
        }
        if (!DATA.items[id].portable) {
            output.push(tf('cantTake', { word }));
            return { newState, output };
        }

        newState.inventory.push(id);
        // NOTE: item placement lives in the shared DATA object by design;
        // callers that need isolation should deep-clone DATA per game.
        place.items = place.items.filter(i => i !== id);
        output.push(tf('youTake', { word }));
        return { newState, output };
    };

    const doDrop = (state, raw) => {
        const newState = cloneState(state);
        const output = [];

        const objectPhrase = objectPhraseFor('drop', raw);
        if (!objectPhrase) {
            output.push(t('whatDrop'));
            return { newState, output };
        }

        const word = stripFillers(objectPhrase.split(/\s+/)).join(' ') || objectPhrase;
        const id = resolveItemPhrase(objectPhrase);

        if (!id || !newState.inventory.includes(id)) {
            output.push(tf('dontHave', { word }));
            return { newState, output };
        }

        newState.inventory = newState.inventory.filter(i => i !== id);
        const place = DATA.places[newState.loc];
        if (!place.items.includes(id)) place.items.push(id);
        output.push(tf('youDrop', { word }));
        return { newState, output };
    };

    const doMove = (state, cmd) => {
        let newState = cloneState(state);
        const output = [];
        const place = DATA.places[newState.loc];
        const availableExits = place.exits || {};

        // 1. Custom exits: an exit key that isn't a canonical direction can be
        // matched by typing the key itself or one of its synonyms.
        for (const exitKey of Object.keys(availableExits)) {
            if (DIRECTIONS.includes(exitKey)) continue;
            const synonymsForExit = DATA.synonyms[exitKey] || [exitKey];
            if (synonymsForExit.includes(cmd) || cmd === exitKey) {
                newState.loc = availableExits[exitKey];
                const lookResult = doLook(newState);
                newState = lookResult.newState;
                output.push(...lookResult.output);
                return { newState, output };
            }
        }

        // 2. Standard directions anywhere in the command ("go north", "n").
        const words = cmd.split(/\s+/);
        const mappedWords = words.map(w => SYNON_MAP[w]);
        const foundDirection = mappedWords.find(w => DIRECTIONS.includes(w));

        if (foundDirection) {
            if (availableExits[foundDirection]) {
                newState.loc = availableExits[foundDirection];
                const lookResult = doLook(newState);
                newState = lookResult.newState;
                output.push(...lookResult.output);
            } else {
                output.push(tf('cantGo', { dir: dirName(foundDirection) }));
            }
            return { newState, output };
        }

        output.push(t('whereGo'));
        return { newState, output };
    };

    const inventoryDisplay = (state) => state.inventory.map(id => {
        const it = DATA.items[id] || {};
        const pretty = itemName(id);
        return it.state != null ? `${pretty} (${it.state})` : pretty;
    }).join(', ');

    const doInventory = (state) => ({
        newState: state,
        output: [tf('youCarry', { inv: inventoryDisplay(state) || t('nothing') })]
    });

    const doHelp = (state) => {
        const place = DATA.places[state.loc];
        const exits = Object.keys(place.exits || {}).map(dirName);
        const items = place.items || [];

        const output = [...(t('helpLines') || [])];
        if (exits.length > 0) {
            output.push(tf('helpExits', { exits: exits.join(', ') }));
        }
        if (items.length > 0) {
            output.push(tf('helpItems', { items: listItems(items) }));
        } else {
            output.push(t('helpNoItems'));
        }
        output.push('---');
        return { newState: state, output };
    };

    const doQuit = (state) => ({ newState: state, output: [t('quitMessage')], shouldQuit: true });

    // Declarative actions from actions.js. Location-specific actions take
    // precedence over global ('*') ones; the first match wins.
    const handleActions = (state, raw) => {
        let newState = cloneState(state);
        const output = [];
        let shouldQuit = false;
        let moved = false;

        const placeActs = DATA.actions[newState.loc] || [];
        const globalActs = DATA.actions['*'] || [];

        for (const a of [...placeActs, ...globalActs]) {
            if (!new RegExp(a.pattern, 'i').test(raw)) continue;
            if (!matchesConditions(newState, a.conditions)) continue;

            output.push(a.response);

            if (a.consume_item) newState.inventory = newState.inventory.filter(i => i !== a.consume_item);
            if (a.add_item && !newState.inventory.includes(a.add_item)) newState.inventory.push(a.add_item);
            if (a.set_flag) newState.flags[a.set_flag] = true;

            if (a.state_change && a.state_change.item) {
                const itemToChange = DATA.items[a.state_change.item];
                if (itemToChange && a.state_change.state !== undefined) {
                    itemToChange.state = a.state_change.state;
                }
            }

            if (a.remove_from_room) {
                DATA.places[newState.loc].items = DATA.places[newState.loc].items.filter(i => i !== a.remove_from_room);
            }
            if (a.reveals) {
                a.reveals.forEach(it => {
                    if (!DATA.places[newState.loc].items.includes(it)) DATA.places[newState.loc].items.push(it);
                });
            }
            if (a.reveals_exit) {
                const place = DATA.places[newState.loc];
                if (!place.exits) place.exits = {};
                place.exits[a.reveals_exit.direction] = a.reveals_exit.destination;
            }

            if (a.go && DATA.places[a.go]) {
                newState.loc = a.go;
                moved = true;
            }

            if (a.game_ending) {
                if (a.game_ending.title) output.push(`--- ${a.game_ending.title} ---`);
                if (a.game_ending.message) output.push(a.game_ending.message);
                shouldQuit = true;
            }

            if (moved) {
                const lookResult = doLook(newState);
                newState = lookResult.newState;
                output.push(...lookResult.output);
            }
            return { handled: true, newState, output, shouldQuit };
        }
        return { handled: false, newState, output, shouldQuit: false };
    };

    const findVerb = (state, words) => {
        const mappedWords = words.map(w => SYNON_MAP[w]);
        const fullNormalizedCmd = words.join(' ');

        const verb = mappedWords.find(v => VERBS.includes(v));
        if (verb) return verb;

        if (mappedWords.some(w => DIRECTIONS.includes(w))) {
            return 'move';
        }

        const place = DATA.places[state.loc];
        if (place.exits) {
            for (const exitKey of Object.keys(place.exits)) {
                const synonymsForExit = DATA.synonyms[exitKey] || [exitKey];
                if (exitKey === fullNormalizedCmd || synonymsForExit.includes(fullNormalizedCmd)) return 'move';
            }
        }
        return undefined;
    };

    // The main entry point for the game logic.
    const processCommand = (state, data, input) => {
        DATA = data;
        let newState = cloneState(state);
        const output = [];

        if (!input.trim()) {
            return { newState, output, shouldQuit: false };
        }
        output.push('');
        output.push(`> ${input}`);

        const startedAtGoal = DATA.meta && DATA.meta.goal && state.loc === DATA.meta.goal;

        // First, try to match a declarative action.
        let result;
        const actionResult = handleActions(newState, input);
        if (actionResult.handled) {
            result = actionResult;
        } else {
            // Otherwise parse as a verb-noun command.
            const cmd = normalize(input);
            const words = cmd.split(/\s+/);
            const mapped = words.map(w => SYNON_MAP[w]);

            switch (findVerb(newState, words)) {
                case 'look':
                    result = mapped.includes('survey') ? doSurvey(newState) : doLook(newState, cmd);
                    break;
                case 'describe': result = doLook(newState, cmd, { describe: true }); break;
                case 'survey': result = doSurvey(newState); break;
                case 'take': result = doTake(newState, cmd); break;
                case 'drop': result = doDrop(newState, cmd); break;
                case 'inventory': result = doInventory(newState); break;
                case 'move': result = doMove(newState, cmd); break;
                case 'light': result = { newState, output: [t('lightWhat')] }; break;
                case 'use': result = { newState, output: [t('cantDoThat')] }; break;
                case 'help': result = doHelp(newState); break;
                case 'quit': result = doQuit(newState); break;
                default: result = { newState, output: [t('dontUnderstand')] }; break;
            }
        }

        let shouldQuit = !!result.shouldQuit;

        // Victory check: arriving at the goal location wins the game.
        if (DATA.meta && DATA.meta.goal && !startedAtGoal && result.newState.loc === DATA.meta.goal) {
            result.output.push('');
            result.output.push(t('victory'));
            shouldQuit = true;
        }

        result.newState.visited = Array.from(result.newState.visited);
        return {
            newState: result.newState,
            output: [...output, ...result.output],
            shouldQuit
        };
    };

    // Sets up the initial state and performs the first "look".
    const init = (data) => {
        DATA = data;
        if (data.synonyms) buildSynonymMap(data.synonyms);
        const initialState = createInitialState();
        const lookResult = doLook(initialState);
        lookResult.newState.visited = Array.from(lookResult.newState.visited);
        return {
            newState: lookResult.newState,
            output: lookResult.output
        };
    };

    return {
        init,
        buildSynonymMap,
        processCommand,
        // Exposed for tooling/tests (validator, solver, UI).
        DIRECTIONS,
        VERBS,
        normalize
    };
})();

// Allow use from Node (tests, tools) as well as the browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameCore;
}
