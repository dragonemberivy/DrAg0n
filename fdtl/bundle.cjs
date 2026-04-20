const fs = require('fs');

let choices = fs.readFileSync('choices.js', 'utf8').replace(/export /g, '');
let mapGen = fs.readFileSync('mapGenerator.js', 'utf8').replace(/export /g, '');
let ai = fs.readFileSync('aiTerminal.js', 'utf8').replace(/export /g, '');
let main = fs.readFileSync('main.js', 'utf8');

// rip out all imports
main = main.replace(/import .*?;/g, '');

const css = fs.readFileSync('style.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

// Find the HTML structure
const bodyExtract = html.match(/<div id="game-container">[\s\S]*?<\/div>/)[0];

const finalCode = `
<!-- FROM DARKNESS TO LIGHT INLINE -->
<style>
${css}
/* Ensure the canvas sits properly directly under the title */
#game-container {
  position: relative !important;
  width: 100% !important;
  height: 800px !important;
  overflow: hidden;
  margin: 0 auto;
  box-shadow: 0 0 40px rgba(0,0,200,0.4);
}
</style>

<div style="width: 100%; max-width: 1200px; margin: 0 auto; margin-bottom: 50px;">
  <h2 style="color:white; text-align:center; font-family:sans-serif; background: black; margin:0; padding:10px;">From Darkness to Light</h2>
  ${bodyExtract}
</div>

<script>
(() => {
${choices}
${mapGen}
${ai}
${main}
})();
</script>
<!-- END INLINE -->
`;

let targetHtml = fs.readFileSync('../maanya2/first_web_page_v2.htm', 'utf8');
// remove the previous iframe injector completely!
targetHtml = targetHtml.replace(/<div style="width: 100%; max-width: 1200px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 0 40px rgba\(0,0,200,0\.4\); margin-bottom: 50px; background: #000;">[\s\S]*?<\/div>/, finalCode);

fs.writeFileSync('../maanya2/first_web_page_v2.htm', targetHtml);
console.log('Bundled successfully!');
