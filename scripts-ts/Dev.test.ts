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

  test('Remove html file', async () => {
    const inPath = 'tests/remove html file.in';
    const outPath = 'tests/remove html file.out';

    try {
      const dev = new Dev({
        ...defaultConfig,
        ...{ in: inPath, out: outPath },
      });
      await dev.init();

      const content = 'Hello, world!';
      await fs.writeFile(path.join(inPath, 'test.html'), content);
      await fs.writeFile(path.join(inPath, 'template.html'), content);
      await sleep(200);
      await fs.unlink(path.join(inPath, 'test.html'));

      await sleep(200);
      expect(dirTree(outPath).children).toEqual(['template.html']);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });

  test('Template file', async () => {
    const inPath = 'tests/template file.in';
    const outPath = 'tests/template file.out';

    try {
      const dev = new Dev({
        ...defaultConfig,
        ...{ in: inPath, out: outPath },
      });
      await dev.init();

      const template = '<!DOCTYPE html>';
      await fs.writeFile(inPath + '/test.html', 'Hello, world');
      await fs.writeFile(inPath + '/template.html', template);
      await sleep(10);

      expect(
        (await fs.readFile(path.join(outPath, 'test', 'index.html'))).toString()
      ).toEqual(template);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });

  test('Change template', async () => {
    const inPath = 'tests/change template.in';
    const outPath = 'tests/change template.out';

    try {
      const dev = new Dev({
        ...defaultConfig,
        ...{ in: inPath, out: outPath },
      });
      await dev.init();

      let template = '<!DOCTYPE html>';
      await fs.writeFile(inPath + '/test.html', 'Hello, world');
      await fs.writeFile(inPath + '/template.html', template);
      await sleep(200);
      template = '<h1>Test</h1>';
      await fs.writeFile(inPath + '/template.html', template);
      await sleep(200);

      expect(
        (await fs.readFile(path.join(outPath, 'test', 'index.html'))).toString()
      ).toEqual(template);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });

  test('Inline script file', async () => {
    const inPath = 'tests/inline script file.in';
    const outPath = 'tests/inline script file.out';

    try {
      const dev = new Dev({
        ...defaultConfig,
        ...{ in: inPath, out: outPath },
      });
      await dev.init();

      const html = '<h1>Hello</h1>';
      const css = 'body { color: black; }';
      const js = 'console.log("Hello, world!")';
      await fs.mkdirs(path.join(inPath, 'Test'));

      await fs.writeFile(inPath + '/template.html', 'template');

      await fs.writeFile(path.join(inPath, 'Test', 'Test.inline-script'), html);
      await fs.writeFile(path.join(inPath, 'Test', 'Test.css'), css);
      await fs.writeFile(path.join(inPath, 'Test', 'Test.js'), js);

      await sleep(200);

      expect(dirTree(outPath).children).toEqual([
        {
          name: 'Test',
          children: ['Test.html', 'index.html'],
        },
        'template.html',
      ]);

      expect(
        (await fs.readFile(path.join(outPath, 'Test', 'Test.html'))).toString()
      ).toEqual(`<h1>Hello</h1>

<style scoped>
body { color: black; }
</style>

<script>
console.log("Hello, world!")
</script>`);
    } catch (e) {
      expect(() => {
        throw e;
      }).not.toThrowError();
    }
  });
});
