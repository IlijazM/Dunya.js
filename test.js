module.exports = {
  name: 'test',

  setupWatcher: function () {
    console.log('Overwritten "setup watcher"');
    return true;
  },
};
