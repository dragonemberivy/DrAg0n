const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
global.document = window.document;
global.window = window;
global.localStorage = { 
  store: {},
  getItem: function(k) { return this.store[k]; }, 
  setItem: function(k, v) { this.store[k] = v; } 
};
global.sessionStorage = { 
  store: {},
  getItem: function(k) { return this.store[k]; }, 
  setItem: function(k, v) { this.store[k] = v; } 
};
global.alert = console.log;

// Mock Firebase
global.firebase = {
  apps: [],
  initializeApp: function() { this.apps.push({}); },
  database: function() {
    return {
      ref: function(path) {
        return {
          transaction: function(cb) {
            console.log("Firebase transaction on " + path + " called!");
          }
        };
      }
    };
  }
};

try {
  require('./assets/js/main.js');
  console.log("1. main.js loaded successfully.");

  // Simulate window load event
  const loadEvent = new window.Event("load");
  window.dispatchEvent(loadEvent);

  const sitePwInput = document.getElementById('site-pw-input');
  const siteUnlockBtn = document.getElementById('site-unlock-btn');
  const siteModal = document.getElementById('site-password-modal');

  if (!sitePwInput || !siteUnlockBtn) {
    throw new Error("Password elements not found!");
  }

  // Test Visitor Password
  console.log("\n2. Testing Visitor Password (chocolate)...");
  sitePwInput.value = "chocolate";
  siteUnlockBtn.click();
  
  if (siteModal.style.display === 'none') {
    console.log("-> SUCCESS: Modal hid itself.");
  } else {
    console.error("-> FAIL: Modal did not hide.");
  }
  
  console.log("-> drag0n_owner flag:", localStorage.getItem('drag0n_owner'));

  // Reset modal
  siteModal.style.display = 'flex';
  
  // Test Owner Password
  console.log("\n3. Testing Owner Password (lotus)...");
  sitePwInput.value = "lotus";
  siteUnlockBtn.click();
  
  if (siteModal.style.display === 'none') {
    console.log("-> SUCCESS: Modal hid itself.");
  } else {
    console.error("-> FAIL: Modal did not hide.");
  }
  
  console.log("-> drag0n_owner flag:", localStorage.getItem('drag0n_owner'));


} catch (e) {
  console.error("ERROR running main.js:");
  console.error(e);
}
