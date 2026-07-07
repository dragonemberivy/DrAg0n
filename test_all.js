const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const pages = ['index.html', 'games.html', 'shop.html', 'chat.html', 'club.html'];

console.log("Starting comprehensive syntax and runtime validation...");

let hasErrors = false;

for (const page of pages) {
  console.log(`\n--- Testing ${page} ---`);
  if (!fs.existsSync(page)) {
    console.error(`❌ ERROR: ${page} does not exist!`);
    hasErrors = true;
    continue;
  }
  
  const html = fs.readFileSync(page, 'utf-8');
  const dom = new JSDOM(html, { runScripts: "outside-only", includeNodeLocations: true, url: "http://localhost" });
  const window = dom.window;
  
  // Mock browser globals
  window.navigator = { userAgent: 'node.js' };
  
  // Storage mocks
  window.localStorage = { 
    store: {}, 
    getItem: function(k) { return this.store[k] || null; }, 
    setItem: function(k, v) { this.store[k] = String(v); }
  };
  window.sessionStorage = { 
    store: {}, 
    getItem: function(k) { return this.store[k] || null; }, 
    setItem: function(k, v) { this.store[k] = String(v); }
  };
  
  window.alert = () => {};
  window.prompt = () => "test";
  window.confirm = () => true;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  
  window.HTMLCanvasElement.prototype.getContext = function() {
    return {
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      fillText: () => {},
      strokeText: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
    };
  };

  // Firebase mock
  window.firebase = {
    apps: [],
    initializeApp: () => {},
    database: () => ({
      ref: () => ({
        on: () => {},
        once: () => Promise.resolve({ val: () => null, exists: () => false }),
        set: () => {},
        push: () => {},
        update: () => {},
        remove: () => {},
        transaction: () => {},
        off: () => {}
      })
    })
  };
  
  // Test scripts
  const scripts = Array.from(window.document.querySelectorAll('script'));
  for (const script of scripts) {
    if (script.src) {
      if (script.src.startsWith('http')) continue; // Skip external
      
      const cleanSrc = script.src.split('?')[0]; // Remove query params
      console.log(`Loading script: ${cleanSrc}`);
      try {
        const srcCode = fs.readFileSync(cleanSrc, 'utf-8');
        window.eval(srcCode);
      } catch (e) {
        console.error(`❌ ERROR in ${cleanSrc}:`, e.message);
        hasErrors = true;
      }
    } else if (script.textContent) {
      try {
        window.eval(script.textContent);
      } catch (e) {
        console.error(`❌ ERROR in inline script on ${page}:`, e.message);
        hasErrors = true;
      }
    }
  }
  
  // Dispatch load event
  try {
    const loadEvent = new window.Event("load");
    window.dispatchEvent(loadEvent);
    console.log(`✅ ${page} loaded without throwing errors.`);
  } catch(e) {
    console.error(`❌ ERROR during window load event on ${page}:`, e.message);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.log("\n❌ Validation completed with errors.");
  process.exit(1);
} else {
  console.log("\n✅ All pages and scripts validated successfully!");
  process.exit(0);
}
