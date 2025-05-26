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
    for (const [canon, list] of Object.entries(DATA.synonyms)) {
        (Array.isArray(list) ? list : [list]).forEach(s => SYNON_MAP[s] = canon);
        SYNON_MAP[canon] = canon;
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

const doLook = (raw = '') => {
    const norm = normalize(raw);
    const words = norm.split(/\s+/);
    const explicitDescribe = /^(beskriv|granska|utforska)\b/.test(norm);

    // --- Först: titta på ett föremål? ---
    if (SYNON_MAP[words[0]] === 'look' && words.length> 1) {
        const target = SYNON_MAP[words.slice(1).join(' ')];
        const place = DATA.places[state.loc];
        if (target && (place.items.includes(target) || state.inventory.includes(target))) {
            print(DATA.items[target].desc);
            return true;
        }
    }

    // --- Fallback: beskriv platsen ---
    const place = DATA.places[state.loc];
    const firstVisit = !state.visited.has(state.loc);

    if ((firstVisit || explicitDescribe) && (place.longDesc || place.ascii)) {
        if (place.ascii)
            print(place.ascii);
        if (place.longDesc)
            print(place.longDesc);
        state.visited.add(state.loc);
    } else {
        print(place.desc);
    }

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

const doMove = cmd => {
    const dir = ['norr', 'söder', 'öster', 'väster', 'upp', 'ned'].find(d => cmd.includes(d));
    if (!dir) {
        print('Vart vill du gå?');
        return;
    }
    const place = DATA.places[state.loc];
    const dest = place.exits[dir];
    if (!dest) {
        print(`Du kan inte gå ${dir}.`);
        return;
    }
    state.loc = dest;
    doLook();
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
    for (const a of[...globalActs, ...placeActs]) {
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
        return true;
    }
    return false;
};

const findVerb = words =>
    words.map(w => SYNON_MAP[w])
    .find(v => ['look', 'survey', 'take', 'move', 'inventory', 'light', 'help', 'quit', 'describe'].includes(v));
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
