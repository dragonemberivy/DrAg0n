const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
global.document = window.document;
global.window = window;
global.localStorage = { getItem: () => null, setItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {} };
global.alert = console.log;

try {
  require('./assets/js/main.js');
  console.log("No errors executing main.js on index.html!");
} catch (e) {
  console.error("ERROR running main.js:");
  console.error(e);
}
