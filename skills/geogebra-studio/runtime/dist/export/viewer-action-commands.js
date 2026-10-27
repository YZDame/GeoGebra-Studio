"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCommandArguments = splitCommandArguments;
exports.evaluateViewerNumber = evaluateViewerNumber;
exports.executeViewerActionCommand = executeViewerActionCommand;
/** Split arguments without breaking strings, nested expressions or lists. */
function splitCommandArguments(input) {
    const args = [];
    let start = 0, quote = '', escaped = false;
    const brackets = [];
    for (let i = 0; i < input.length; i++) {
        const c = input[i];
        if (quote) {
            if (escaped)
                escaped = false;
            else if (c === '\\')
                escaped = true;
            else if (c === quote)
                quote = '';
        }
        else if (c === '"')
            quote = c;
        else if ('([{'.includes(c))
            brackets.push(c);
        else if (')]}'.includes(c)) {
            if (brackets.pop() !== '([{'.charAt(')]}'.indexOf(c)))
                throw new Error('Unbalanced command arguments');
        }
        else if (c === ',' && !brackets.length) {
            args.push(input.slice(start, i).trim());
            start = i + 1;
        }
    }
    if (quote || brackets.length)
        throw new Error('Unbalanced command arguments');
    args.push(input.slice(start).trim());
    return args;
}
/** getValue returns 0 for malformed/unknown expressions, so check definition first. */
function evaluateViewerNumber(api, expression) {
    const literal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(expression);
    if (!literal && (!api.getValue || api.getValue(`IsDefined(${expression})`) !== 1)) {
        throw new Error(`Expected a defined numeric expression: ${expression}`);
    }
    const value = literal ? Number(expression) : api.getValue(expression);
    if (!Number.isFinite(value))
        throw new Error(`Expected a finite numeric value: ${expression}`);
    return value;
}
function executeViewerActionCommand(api, command) {
    const match = /^\s*(SetCoords|SetVisibleInView|SetFixed|ShowLabel|SetLabelMode|SetCaption|SetFilling|SetLayer|SetPointStyle|SetValue|SetTextValue|SetTrace|SetAuxiliary|SetAnimating|SetAnimationSpeed)\s*(?:\(([\s\S]*)\)|\[([\s\S]*)\])\s*$/.exec(command);
    if (!match)
        return null;
    const operation = match[1];
    const args = splitCommandArguments(match[2] ?? match[3]);
    const target = args.shift();
    // Keep computed targets/list actions with GeoGebra's expression parser.
    if (!/^(?:[\p{L}_][\p{L}\p{N}_{}']*|"[^"\n]+")$/u.test(target))
        return null;
    const name = target.replace(/^"|"$/g, '');
    if (!api.exists(name))
        throw new Error(`Action target does not exist: ${name}`);
    const arity = (min, max = min) => {
        if (args.length < min || args.length > max)
            throw new Error(`${operation}: expected ${min === max ? min : `${min}..${max}`} arguments after the target`);
    };
    const number = (value) => {
        const n = evaluateViewerNumber(api, value);
        return n;
    };
    const boolean = (value) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        const n = number(value);
        if (n !== 0 && n !== 1)
            throw new Error(`${operation}: expected a boolean: ${value}`);
        return Boolean(n);
    };
    const text = (value) => {
        if (!/^"(?:[^"\\]|\\.)*"$/s.test(value))
            throw new Error(`${operation}: expected quoted text`);
        return JSON.parse(value);
    };
    switch (operation) {
        case 'SetCoords':
            arity(2, 3);
            api.setCoords(name, ...args.map(number));
            break;
        case 'SetVisibleInView': {
            arity(2);
            const view = number(args[0]);
            if (view !== 1 && view !== -1)
                throw new Error('This viewer supports SetVisibleInView for view 1 (2D) or -1 (3D) only');
            api.setVisible(name, boolean(args[1]));
            break;
        }
        case 'SetFixed':
            arity(1, 2);
            api.setFixed(name, boolean(args[0]), ...(args.length === 2 ? [boolean(args[1])] : []));
            break;
        case 'ShowLabel':
            arity(1);
            api.setLabelVisible(name, boolean(args[0]));
            break;
        case 'SetCaption':
            arity(1);
            api.setCaption(name, text(args[0]));
            break;
        case 'SetTextValue':
            arity(1);
            api.setTextValue(name, text(args[0]));
            break;
        case 'SetValue':
            arity(1);
            api.setValue(name, args[0] === 'true' ? 1 : args[0] === 'false' ? 0 : number(args[0]));
            break;
        case 'SetTrace':
            arity(1);
            api.setTrace(name, boolean(args[0]));
            break;
        case 'SetAuxiliary':
            arity(1);
            api.setAuxiliary(name, boolean(args[0]));
            break;
        case 'SetAnimating':
            arity(1);
            api.setAnimating(name, boolean(args[0]));
            break;
        case 'SetAnimationSpeed':
            arity(1);
            api.setAnimationSpeed(name, number(args[0]));
            break;
        default: {
            arity(1);
            const n = number(args[0]);
            const maximum = operation === 'SetFilling' ? 1 : operation === 'SetLabelMode' ? 3 : 9;
            if (n < 0 || n > maximum || (operation !== 'SetFilling' && !Number.isInteger(n)))
                throw new Error(`${operation}: value outside 0..${maximum}`);
            if (operation === 'SetFilling')
                api.setFilling(name, n);
            else if (operation === 'SetLayer')
                api.setLayer(name, n);
            else if (operation === 'SetLabelMode')
                api.setLabelStyle(name, n);
            else
                api.setPointStyle(name, n);
        }
    }
    return true;
}
//# sourceMappingURL=viewer-action-commands.js.map