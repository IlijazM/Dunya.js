const path = require('path');
const fs = require('fs-extra');

import Dev from './Dev.js';

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

function dirTree(filename: string) {
  var stats = fs.lstatSync(filename),
    info = path.basename(filename);

  if (stats.isDirectory()) {
    info = {
      name: info,
      children: fs.readdirSync(filename).map(function (child: string) {
        return dirTree(filename + '/' + child);
      }),
    };
  }

  return info;
}

const defaultConfig = {
  ip: '0.0.0.0',
  port: 8080,

  in: 'tests/src',
  out: 'tests/dev',

  noAutoInit: true,
  watcher: true,

  plugins: [],
  watcherConfig: {},
  props: {},
};

describe('Dev', () => {
  console.log = function () {};

  fs.emptyDirSync('tests');

  test('Starting', async () => {
    try {
      const dev = new Dev({ ...defaultConfig, ...{ watcher: false } });
      await dev.init();
      expect(1).toEqual(1);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });

  test('Watcher', async () => {
    try {
      const dev = new Dev({ ...defaultConfig });
      await dev.init();
      expect(1).toEqual(1);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });

  test('Clear out directory', async () => {
    const inPath = 'tests/clear out directory.in';
    const outPath = 'tests/clear out directory.out';

    try {
      const content = 'Hello, world!';
      await fs.mkdirs(outPath, (err) => {});
      await fs.writeFile(outPath + '/test.txt', content);

      const dev = new Dev({
        ...defaultConfig,
        ...{ in: inPath, out: outPath },
      });
      await dev.init();

      expect(fs.existsSync(outPath + '/test.txt')).toEqual(false);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });

  test('Sync file', async () => {
    const inPath = 'tests/sync file.in';
    const outPath = 'tests/sync file.out';

    try {
      const dev = new Dev({
        ...defaultConfig,
        ...{ in: inPath, out: outPath },
      });
      await dev.init();

      const content = 'Hello, world!';
      await fs.writeFile(path.join(inPath, 'test.txt'), content);
      await sleep(10);
      expect(
        fs.readFileSync(path.join(outPath, 'test.txt')).toString()
      ).toEqual(content);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });

  test('Remove file', async () => {
    const inPath = 'tests/remove file.in';
    const outPath = 'tests/remove file.out';

    try {
      const dev = new Dev({
        ...defaultConfig,
        ...{ in: inPath, out: outPath },
      });
      await dev.init();

      const content = 'Hello, world!';
      await fs.writeFile(path.join(inPath, 'test.txt'), content);
      await sleep(200);
      await fs.unlink(path.join(inPath, 'test.txt'));
      await sleep(200);

      expect(fs.existsSync(path.join(outPath, 'test.txt'))).toEqual(false);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });

  test('HTML file', async () => {
    const inPath = 'tests/html file.in';
    const outPath = 'tests/html file.out';

    try {
      const dev = new Dev({
        ...defaultConfig,
        ...{ in: inPath, out: outPath },
      });
      await dev.init();

      const content = 'Hello, world!';
      await fs.mkdirs(inPath, (err) => {});
      await fs.mkdirs(outPath, (err) => {});
      await fs.writeFile(inPath + '/test.html', content);
      await fs.writeFile(inPath + '/template.html', content);
      await sleep(10);

      expect(dirTree(outPath).children).toEqual([
        'template.html',
        {
          name: 'test',
          children: ['index.html', 'test.html'],
        },
      ]);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });
});
