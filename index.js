const Pipe = require(`./scripts/Pipe`).default;
const Chain = require(`./scripts/Chain`).default;

new Chain(['dev', 'build'], {
  ip: null,
  port: null,
  inputDir: null,
  outputDir: null,
  noWatcher: null,
  noServer: null,
  autoTerminate: null,
});
