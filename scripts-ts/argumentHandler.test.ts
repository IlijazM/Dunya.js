import { resolve } from 'path';
import argumentHandler from './argumentHandler';

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

    argumentHandler(args, config, userArgs);

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
      await argumentHandler(args, config);
    } catch (e) {
      err = e;
    }

    expect(err).not.toBeNull();
  });
});
