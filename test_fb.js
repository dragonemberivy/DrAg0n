const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Wait for firebase to load
setTimeout(() => {
  if (window.firebase) {
    const userRef = window.firebase.database().ref('users/test12345');
    userRef.once('value')
      .then(snap => {
        console.log("Firebase read success! Exists:", snap.exists());
        process.exit(0);
      })
      .catch(e => {
        console.error("Firebase read ERROR:", e.message);
        process.exit(1);
      });
  } else {
    console.error("Firebase not loaded!");
    process.exit(1);
  }
}, 3000);
