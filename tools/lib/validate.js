// Static validation of a world definition. Catches broken references before
// they become runtime bugs: exits to non-existent places, actions that reveal
// unknown items, invalid regex patterns, effect keys the engine ignores, etc.

const DIRECTIONS = ['north', 'south', 'east', 'west', 'up', 'down'];
const VERBS = ['look', 'survey', 'describe', 'take', 'drop', 'move',
    'inventory', 'light', 'use', 'help', 'quit'];

// Action keys the engine (core.js) actually understands. Anything else is
// almost certainly a typo or a leftover from an older engine version.
const KNOWN_ACTION_KEYS = ['pattern', 'conditions', 'response', 'state_change',
    'reveals', 'reveals_exit', 'consume_item', 'add_item', 'set_flag',
    'remove_from_room', 'go', 'game_ending', 'hint'];

const KNOWN_CONDITION_PREFIXES = ['item:', 'has:', 'not_has:', 'has_flag:',
    'not_has_flag:', 'at_location:'];

function validateWorld(world) {
    const errors = [];
    const warnings = [];
    const { places = {}, items = {}, synonyms = {}, actions = {}, meta = {} } = world;

    const placeIds = new Set(Object.keys(places));
    const itemIds = new Set(Object.keys(items));

    if (placeIds.size === 0) errors.push('World has no places.');

    // --- meta ---
    if (meta.start && !placeIds.has(meta.start)) {
        errors.push(`meta.start "${meta.start}" is not a known place.`);
    }
    if (meta.goal && !placeIds.has(meta.goal)) {
        errors.push(`meta.goal "${meta.goal}" is not a known place.`);
    }
    if (!meta.goal) {
        warnings.push('meta.goal is not set; the game has no winning condition.');
    }

    const validateCondition = (cond, where) => {
        if (typeof cond !== 'string' || !KNOWN_CONDITION_PREFIXES.some(p => cond.startsWith(p))) {
            errors.push(`${where}: unknown condition "${cond}".`);
            return;
        }
        if (cond.startsWith('item:')) {
            const [, id] = cond.split(':');
            if (!itemIds.has(id)) errors.push(`${where}: condition "${cond}" references unknown item "${id}".`);
        } else if (cond.startsWith('has:') || cond.startsWith('not_has:')) {
            const id = cond.split(':')[1];
            if (!itemIds.has(id)) errors.push(`${where}: condition "${cond}" references unknown item "${id}".`);
        } else if (cond.startsWith('at_location:')) {
            const id = cond.substring('at_location:'.length);
            if (!placeIds.has(id)) errors.push(`${where}: condition "${cond}" references unknown place "${id}".`);
        }
    };

    // --- places ---
    for (const [placeId, place] of Object.entries(places)) {
        if (!place.desc) errors.push(`Place "${placeId}" has no desc.`);
        (place.descVariants || []).forEach((v, i) => {
            const where = `Place "${placeId}" descVariants[${i}]`;
            if (!v.desc) errors.push(`${where} has no desc.`);
            if (!v.conditions || !v.conditions.length) {
                warnings.push(`${where} has no conditions and will always override the default desc.`);
            }
            (v.conditions || []).forEach(c => validateCondition(c, where));
        });
        for (const [dir, dest] of Object.entries(place.exits || {})) {
            if (!placeIds.has(dest)) {
                errors.push(`Place "${placeId}" exit "${dir}" leads to unknown place "${dest}".`);
            }
            if (!DIRECTIONS.includes(dir) && !synonyms[dir]) {
                warnings.push(`Place "${placeId}" exit "${dir}" is not a standard direction and has no synonyms entry; players must type it verbatim.`);
            }
        }
        for (const itemId of place.items || []) {
            if (!itemIds.has(itemId)) {
                errors.push(`Place "${placeId}" contains unknown item "${itemId}".`);
            }
        }
    }

    // --- items ---
    for (const [itemId, item] of Object.entries(items)) {
        if (!item.desc) warnings.push(`Item "${itemId}" has no desc.`);
        if (!synonyms[itemId]) {
            warnings.push(`Item "${itemId}" has no synonyms entry; players cannot refer to it.`);
        }
    }

    // --- synonyms ---
    const canonSeen = {};
    for (const [canon, list] of Object.entries(synonyms)) {
        const words = Array.isArray(list) ? list : [list];
        const known = itemIds.has(canon) || placeIds.has(canon) ||
            DIRECTIONS.includes(canon) || VERBS.includes(canon);
        if (!known) {
            warnings.push(`Synonym group "${canon}" does not match any item, place, direction or engine verb.`);
        }
        for (const word of words) {
            if (canonSeen[word] && canonSeen[word] !== canon) {
                errors.push(`Synonym "${word}" maps to both "${canonSeen[word]}" and "${canon}".`);
            }
            canonSeen[word] = canon;
        }
    }

    // --- actions ---
    for (const [locId, acts] of Object.entries(actions)) {
        if (locId !== '*' && !placeIds.has(locId)) {
            errors.push(`Actions defined for unknown place "${locId}".`);
        }
        (acts || []).forEach((a, i) => {
            const where = `Action ${locId}[${i}]`;
            if (!a.response) errors.push(`${where} has no response.`);
            if (!a.pattern) {
                errors.push(`${where} has no pattern.`);
            } else {
                try { new RegExp(a.pattern, 'i'); }
                catch (e) { errors.push(`${where} has invalid regex pattern: ${e.message}`); }
            }
            (a.conditions || []).forEach(c => validateCondition(c, where));

            for (const key of Object.keys(a)) {
                if (!KNOWN_ACTION_KEYS.includes(key)) {
                    warnings.push(`${where} uses unknown key "${key}" which the engine will ignore.`);
                }
            }
            if (a.state_change && a.state_change.item && !itemIds.has(a.state_change.item)) {
                errors.push(`${where} state_change references unknown item "${a.state_change.item}".`);
            }
            (a.reveals || []).forEach(id => {
                if (!itemIds.has(id)) errors.push(`${where} reveals unknown item "${id}".`);
            });
            if (a.reveals_exit && !placeIds.has(a.reveals_exit.destination)) {
                errors.push(`${where} reveals_exit to unknown place "${a.reveals_exit.destination}".`);
            }
            if (a.go && !placeIds.has(a.go)) {
                errors.push(`${where} go references unknown place "${a.go}".`);
            }
            if (a.consume_item && !itemIds.has(a.consume_item)) {
                errors.push(`${where} consume_item references unknown item "${a.consume_item}".`);
            }
            if (a.add_item && !itemIds.has(a.add_item)) {
                errors.push(`${where} add_item references unknown item "${a.add_item}".`);
            }
        });
    }

    // --- Shadowed actions: an unconditional action makes later ones in the
    // same list with the same pattern unreachable. ---
    for (const [locId, acts] of Object.entries(actions)) {
        (acts || []).forEach((a, i) => {
            if (a.conditions && a.conditions.length) return;
            for (let j = i + 1; j < acts.length; j++) {
                if (acts[j].pattern === a.pattern) {
                    warnings.push(`Action ${locId}[${j}] is unreachable: shadowed by unconditional action ${locId}[${i}] with the same pattern.`);
                }
            }
        });
    }

    return { errors, warnings, ok: errors.length === 0 };
}

module.exports = { validateWorld, DIRECTIONS, VERBS, KNOWN_ACTION_KEYS };
