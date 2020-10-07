// const { default: Dev } = require('./scripts/Dev');

// const dev = new Dev();

const path = require('path');
const fs = require('fs');

const c = dirTree('./scripts');
console.log(JSON.stringify(c.children, null, 2));
