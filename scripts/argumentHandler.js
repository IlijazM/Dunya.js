"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function handleArgs(args, ...overwriteArguments) {
    overwriteArguments.forEach((other) => {
        overwriteArgs(args, other);
    });
}
exports.default = handleArgs;
function overwriteArgs(args, other) {
    for (let [index, value] of Object.entries(args)) {
        if (other[index] === undefined)
            continue;
        if (typeof other[index] !== typeof args[index])
            throw new TypeError(`The argument '${index}' must be of type '${typeof args[index]}'.`);
        args[index] = other[index];
    }
}
