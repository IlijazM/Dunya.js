const Pipe = require(`./scripts/Pipe`).default;
const Chain = require(`./scripts/Chain`).default;

new Chain(['ed'], {
  ip: null,
  port: null,
  inputDir: null,
  outputDir: null,
  noWatcher: null,
  noServer: null,
  autoTerminate: null,
});
