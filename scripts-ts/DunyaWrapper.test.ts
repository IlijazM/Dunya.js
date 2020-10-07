import DunyaWrapper from './DunyaWrapper.js';

describe('Dunya Wrapper', () => {
  test('overwrite args.', () => {
    const dw = new DunyaWrapper();

    const args = {
      foo: '',
    };

    const overwrite = {
      foo: 'bar',
    };

    dw.overwriteArgs(args, overwrite);

    expect(args.foo).toEqual('bar');
  });

  test('overwrite multiple args.', () => {
    const dw = new DunyaWrapper();

    const args = {
      foo: '',
      bar: 0,
    };

    const overwrite1 = {
      foo: 'bar',
      bar: 1,
    };

    const overwrite2 = {
      foo: 'baz',
    };

    dw.handleArgs(args, overwrite1, overwrite2);

    expect(args).toEqual({
      foo: 'baz',
      bar: 1,
    });
  });

  test('typeOf', () => {
    const dw = new DunyaWrapper();
    expect(dw.typeOf(undefined)).toEqual('undefined');
    expect(dw.typeOf(null)).toEqual('null');
    expect(dw.typeOf(0)).toEqual('number');
    expect(dw.typeOf(0n)).toEqual('bigint');
    expect(dw.typeOf('')).toEqual('string');
    expect(dw.typeOf(true)).toEqual('boolean');
    expect(dw.typeOf(() => {})).toEqual('function');
    expect(dw.typeOf(/./)).toEqual('regex');
    expect(dw.typeOf({})).toEqual('object');
    expect(dw.typeOf([])).toEqual('array');
  });

  test('validateTypes', () => {
    const dw = new DunyaWrapper();

    expect(() => {
      dw.validateTypes('foo', 'bar');
    }).not.toThrowError();
    expect(() => {
      dw.validateTypes('foo', 10);
    }).toThrowError();
    expect(() => {
      dw.validateTypes([], {});
    }).toThrowError();
    expect(() => {
      dw.validateTypes(null, {});
    }).toThrowError();
  });

  test('overwrite wrong types', () => {
    const dw = new DunyaWrapper();

    const args = {
      foo: [],
      bar: 'string',
    };

    expect(() => {
      dw.handleArgs(args, { foo: 10 });
    }).toThrowError();
    expect(() => {
      dw.handleArgs(args, { foo: {} });
    }).toThrowError();
    expect(() => {
      dw.handleArgs(args, { foo: [] });
    }).not.toThrowError();
    expect(() => {
      dw.handleArgs(args, { foo: [], bar: 0 });
    }).toThrowError();
  });

  test('merge objects', () => {
    const dw = new DunyaWrapper();

    let args, overwrite1, overwrite2;

    args = {
      foo: { bar: 'bar' },
    };

    overwrite1 = {
      foo: { baz: 'baz' },
    };

    overwrite2 = {
      foo: { foo: 'foo' },
    };

    dw.handleArgs(args, overwrite1, overwrite2);

    expect(args.foo).toEqual({
      bar: 'bar',
      baz: 'baz',
      foo: 'foo',
    });

    args = {
      foo: ['foo'],
    };

    overwrite1 = {
      foo: ['bar'],
    };

    overwrite2 = {
      foo: ['baz'],
    };

    dw.handleArgs(args, overwrite1, overwrite2);

    expect(args.foo).toEqual(['foo', 'bar', 'baz']);
  });
});
