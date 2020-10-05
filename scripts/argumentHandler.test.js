"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argumentHandler_1 = require("./argumentHandler");
describe('argumentHandler', () => {
    test('argument overwriting', () => {
        let args = {
            string: 'foo',
            number: 2020,
        };
        let config = {
            string: 'baz',
        };
        let userArgs = {
            string: 'bar',
        };
        argumentHandler_1.default(args, config, userArgs);
        expect(args.string).toBe('bar');
    });
    test('argument type error', async () => {
        let args = {
            string: '',
        };
        let config = {
            string: 10,
        };
        let err = null;
        try {
            await argumentHandler_1.default(args, config);
        }
        catch (e) {
            err = e;
        }
        expect(err).not.toBeNull();
    });
});
