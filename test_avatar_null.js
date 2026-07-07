const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
global.document = window.document;
global.window = window;

// Mock Firebase
global.firebase = {
  apps: [],
  initializeApp: function() { this.apps.push({}); },
  database: function() {
    return {
      ref: function(path) {
        return {
          on: function(ev, cb) { cb({ val: () => ({}) }); },
          off: function() {},
          once: function() { return Promise.resolve({ val: () => null }); },
          transaction: function(cb) {}
        };
      }
    };
  }
};

// Simulate localStorage
const store = {
  'drag0n_user': 'TestUser',
  'drag0n_avatar': null, // Avatar is null!
  'drag0n_dc': '1000'
};
global.localStorage = {
  getItem: (k) => store[k],
  setItem: (k, v) => { store[k] = v; }
};
global.sessionStorage = { getItem: () => 'true', setItem: () => {} };

try {
  require('./assets/js/main.js');
  console.log("main.js parsed successfully.");
  
  // Trigger load
  const loadEvent = new window.Event("load");
  window.dispatchEvent(loadEvent);
  
  const nameEl = document.getElementById('pw-name');
  console.log("SUCCESS: pw-name content:", nameEl.innerHTML);
} catch(e) {
  console.error("FAIL:", e);
}
