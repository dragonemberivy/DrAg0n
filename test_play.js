const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    const filePath = 'file://' + path.resolve(__dirname, 'fc24-squad-builder.html');
    console.log("Navigating to page:", filePath);
    await page.goto(filePath, { waitUntil: 'networkidle2' });
    
    // Screenshot 1: Starting Team
    console.log("Taking screenshot of starting team...");
    await page.screenshot({ path: '/Users/spiff/.gemini/antigravity/brain/28b0fca9-997b-45f2-918c-4fe24fe16e9d/step1_starting_team.png' });
    
    // Click Open Pack
    console.log("Opening pack...");
    await page.click('#open-pack-btn');
    await new Promise(r => setTimeout(r, 1000)); // wait for slide-in
    
    // Screenshot 2: Pack Screen
    await page.screenshot({ path: '/Users/spiff/.gemini/antigravity/brain/28b0fca9-997b-45f2-918c-4fe24fe16e9d/step2_pack_opened.png' });
    
    // Click Pack to Rip Open
    await page.click('#pack-wrapper-anim');
    await new Promise(r => setTimeout(r, 3000)); // wait for walkout animation
    
    // Screenshot 3: Player Unlocked
    await page.screenshot({ path: '/Users/spiff/.gemini/antigravity/brain/28b0fca9-997b-45f2-918c-4fe24fe16e9d/step3_player_unlocked.png' });
    
    // Close pack reveal
    console.log("Sending player to bench...");
    const closeBtn = await page.$('#pack-drawer button');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 500));
    
    // Click Play Match
    console.log("Launching Match Center...");
    await page.click('#launch-match-btn');
    await new Promise(r => setTimeout(r, 1000));
    
    // Screenshot 4: Match Center Ready
    await page.screenshot({ path: '/Users/spiff/.gemini/antigravity/brain/28b0fca9-997b-45f2-918c-4fe24fe16e9d/step4_match_ready.png' });
    
    // Start Match
    console.log("Starting match...");
    await page.click('#start-match-btn');
    
    // We will poll for the penalty phase or match end. Let's wait for a while to capture standard minutes or shootout
    for (let i = 0; i < 35; i++) {
      await new Promise(r => setTimeout(r, 2000));
      
      const isPenalty = await page.evaluate(() => {
        const el = document.getElementById("shootout-message");
        return el && el.style.display !== "none";
      });
      
      if (isPenalty) {
        console.log("Penalty Shootout detected! Taking a shot...");
        // Click on the canvas inside the goal posts
        const canvasRect = await page.evaluate(() => {
          const c = document.getElementById("penalty-canvas");
          const r = c.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 3 };
        });
        await page.mouse.click(canvasRect.x, canvasRect.y);
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: '/Users/spiff/.gemini/antigravity/brain/28b0fca9-997b-45f2-918c-4fe24fe16e9d/step5_shootout_action.png' });
        await new Promise(r => setTimeout(r, 2000));
      }
      
      const isEnded = await page.evaluate(() => {
        const el = document.getElementById("close-match-btn");
        return el && el.style.display !== "none";
      });
      
      if (isEnded) {
        console.log("Match ended!");
        break;
      }
    }
    
    // Screenshot 6: Match End Results
    await page.screenshot({ path: '/Users/spiff/.gemini/antigravity/brain/28b0fca9-997b-45f2-918c-4fe24fe16e9d/step6_match_ended.png' });
    
    // Leave Match Center
    await page.click('#close-match-btn');
    await new Promise(r => setTimeout(r, 1000));
    
  } catch (err) {
    console.error("Automation error:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
})();
