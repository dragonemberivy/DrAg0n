const contentDiv = document.getElementById('browser-content');
const urlInput = document.getElementById('browser-url');

let historyStack = [];
let historyIndex = -1;

function navigate(url, skipHistory = false) {
  if (!skipHistory) {
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex++;
  }
  urlInput.value = url;
  renderPage(url);
}

window.browserBack = () => {
  if (historyIndex > 0) {
    historyIndex--;
    navigate(historyStack[historyIndex], true);
  }
};

window.browserForward = () => {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    navigate(historyStack[historyIndex], true);
  }
};

window.navigate = navigate;

// Seeded PRNG for procedural generation
function getSeededRandom(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function() {
    h += 0xe120fc15;
    let tmp = Math.imul(h ^ (h >>> 15), 1 | h);
    tmp = (tmp + Math.imul(tmp ^ (tmp >>> 7), 61 | tmp)) ^ tmp;
    return (((tmp ^ (tmp >>> 14)) >>> 0) / 4294967296);
  }
}

// Helper to pick seeded random from array
function seededPick(arr, randFn) {
  return arr[Math.floor(randFn() * arr.length)];
}

function renderPage(url) {
  let base = url;
  let query = '';
  if (url.includes('?')) {
    [base, query] = url.split('?');
  }

  if (base.startsWith('http://') || base.startsWith('https://')) {
    renderWebSite(base);
  } else if (base === 'dragon://search') {
    renderSearch(query);
  } else if (base.startsWith('dragon://tube')) {
    renderTube(base, query);
  } else if (base.startsWith('dragon://wiki')) {
    renderWiki(base);
  } else if (base.startsWith('dragon://news')) {
    renderNews(base);
  } else if (base.startsWith('dragon://weather')) {
    renderWeather(base, query);
  } else {
    contentDiv.innerHTML = `<div class="fake-site" style="background:#090d16; min-height:100vh;"><h1 style="color:#ef4444; text-align:center;">404 - Dragon Not Found</h1></div>`;
  }
}

// --- SEARCH ENGINE (Infinite Seeded Search Results) ---
function renderSearch(query) {
  let searchVal = query ? decodeURIComponent(query.replace('q=', '').replace(/\+/g, ' ')).trim() : '';
  let resultsHTML = '';

  if (searchVal) {
    const cleanQuery = searchVal.toLowerCase();
    let matches = [];

    // 1. Static/Preset matches
    if (cleanQuery.includes('coin') || cleanQuery.includes('dc') || cleanQuery.includes('money')) {
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://wiki/Dragon_Coins')" class="ds-link">DragonWiki: Dragon Coins</a>
          <div class="ds-desc">Learn all about the history and economy of Dragon Coins (DC), the primary currency...</div>
        </div>
      `);
    }
    if (cleanQuery.includes('game') || cleanQuery.includes('play') || cleanQuery.includes('flappy') || cleanQuery.includes('snake')) {
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://wiki/Flappy_Dragon')" class="ds-link">DragonWiki: Flappy Dragon</a>
          <div class="ds-desc">An in-depth article detailing the history, mechanics, and strategies of the popular arcade game...</div>
        </div>
      `);
    }
    if (cleanQuery.includes('weather') || cleanQuery.includes('forecast') || cleanQuery.includes('temp') || cleanQuery.includes('rain')) {
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://weather?loc=' + encodeURIComponent('${searchVal}'))" class="ds-link">Local Weather Forecast for ${searchVal}</a>
          <div class="ds-desc">Is it safe to fly in ${searchVal} today? Check the latest atmospheric conditions...</div>
        </div>
      `);
    }

    // 2. Dynamic Video Result related directly to search term
    let videoId = encodeURIComponent(searchVal);
    matches.push(`
      <div class="ds-result">
        <a href="#" onclick="window.navigate('dragon://tube/watch?v=${videoId}')" class="ds-link">DragonTube: Trending Video on "${searchVal}"</a>
        <div class="ds-desc">Stream this real video covering "${searchVal}" directly inside the browser. No YouTube player required.</div>
      </div>
    `);

    // 3. NEW: Dynamic Infinite WEBSITE Matches!
    const cleanDomain = searchVal.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domains = [
      `www.${cleanDomain}planet.dragon`,
      `the${cleanDomain}hub.dragon`,
      `www.${cleanDomain}defense.dragon`
    ];
    
    // Choose one website domain dynamically
    const randDom = getSeededRandom(cleanQuery);
    const domainSelected = seededPick(domains, randDom);
    matches.push(`
      <div class="ds-result">
        <div style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 2px;">http://${domainSelected}</div>
        <a href="#" onclick="window.navigate('http://${domainSelected}')" class="ds-link">${searchVal.charAt(0).toUpperCase() + searchVal.slice(1)} Portal - Official Site</a>
        <div class="ds-desc">Welcome to the official community gateway for ${searchVal.toLowerCase()}. Explore forums, download resources, and chat with local users.</div>
      </div>
    `);

    // 4. Procedural Wiki Matches
    const rand = getSeededRandom(cleanQuery);
    const numProcedural = 1 + Math.floor(rand() * 2);

    const subjects = ["Ancient", "Future", "Secret", "Cursed", "Glow-in-the-dark", "Invisible", "Cybernetic", "Quantum", "Mystical"];
    const nouns = ["Artifacts", "Portals", "Dragons", "AI Agents", "Virtual Worlds", "Hacking Tools", "Whiteboards", "Void Crystals", "Nebula Cores"];
    const actions = ["discovered inside the codebase", "powering the Jukebox", "hiding behind the password lock", "fueling the Flappy leaderboards", "found in a local sandbox"];
    
    for (let i = 0; i < numProcedural; i++) {
      const topic = `${seededPick(subjects, rand)} ${seededPick(nouns, rand)}`;
      const urlTopic = topic.replace(/ /g, '_');
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://wiki/${urlTopic}')" class="ds-link">DragonWiki: ${topic}</a>
          <div class="ds-desc">A deep dive study on the mysterious ${topic.toLowerCase()} that was recently ${seededPick(actions, rand)}. Read documentation and findings...</div>
        </div>
      `);
    }

    resultsHTML = `
      <div class="ds-results">
        <div style="color:#94a3b8; margin-bottom: 20px;">About 3,141,592 results (0.42 seconds) for <b>${searchVal}</b></div>
        ${matches.join('')}
      </div>
    `;
  }

  contentDiv.innerHTML = `
    <div class="fake-site" style="background:#090d16; min-height:100vh;">
      <div class="ds-logo">
        <span style="color:#38bdf8">D</span><span style="color:#818cf8">r</span><span style="color:#fb7185">a</span><span style="color:#38bdf8">g</span><span style="color:#34d399">o</span><span style="color:#f43f5e">n</span><span style="color:#94a3b8; font-size: 2rem;">Search</span>
      </div>
      <form onsubmit="event.preventDefault(); window.navigate('dragon://search?q=' + encodeURIComponent(document.getElementById('ds-in').value));">
        <input type="text" class="ds-input" id="ds-in" value="${searchVal}" placeholder="Search for anything...">
        <button class="ds-btn" type="submit">Dragon Search</button>
      </form>
      ${resultsHTML}
    </div>
  `;
}

// --- FAKE WEBSITE RENDERER (Infinite Seeded Websites!) ---
function renderWebSite(url) {
  const domain = url.replace('http://', '').replace('https://', '').split('/')[0];
  const cleanDomain = domain.replace('www.', '').split('.')[0];
  
  // Seeded generation matching the specific domain name
  const rand = getSeededRandom(domain);
  const themeHue = Math.floor(rand() * 360);
  const accentColor = `hsl(${themeHue}, 80%, 60%)`;
  const bgGradient = `linear-gradient(135deg, #090d16, hsl(${themeHue}, 40%, 10%))`;
  
  const siteTypes = ["Community Hub", "Database", "Security Grid", "Official Archive", "Research Portal"];
  const type = seededPick(siteTypes, rand);
  
  const welcomes = ["Welcome to the database.", "Data streams stabilized.", "Authorized access granted.", "Grid online."];
  const welcome = seededPick(welcomes, rand);
  
  const p1 = `This system was initialized to store, monitor, and catalog records related to ${cleanDomain}. The network currently registers over ${Math.floor(rand() * 50000 + 100)} active terminals across the sector.`;
  const p2 = `By accessing this ${type.toLowerCase()}, users can run diagnostic reports, query local databases, and sync settings directly to the main server registers. Ensure you keep your DC balance safe at all times.`;

  // Draw the custom website content
  contentDiv.innerHTML = `
    <div class="fake-site" style="background:${bgGradient}; min-height:100vh; color:#e2e8f0; font-family:'Outfit', sans-serif;">
      <!-- Web site header banner -->
      <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 30px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:2.2rem; color:${accentColor}; margin:0; text-shadow: 0 0 20px rgba(255,255,255,0.1); text-transform:capitalize;">${cleanDomain} Portal</h1>
          <span style="color:#94a3b8; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px;">${type}</span>
        </div>
        <div style="font-size: 2.5rem;">🌐</div>
      </div>
      
      <!-- Content columns -->
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:30px;">
        <div class="glass-card" style="background:rgba(255,255,255,0.02); border-color:rgba(255,255,255,0.1); padding:25px; border-radius:12px;">
          <h2 style="color:${accentColor}; margin-top:0;">${welcome}</h2>
          <p style="font-size:1.1rem; line-height:1.6; color:#cbd5e1;">${p1}</p>
          <p style="font-size:1.1rem; line-height:1.6; color:#cbd5e1;">${p2}</p>
          
          <div style="margin-top: 30px; display:flex; gap:10px;">
            <button onclick="alert('Accessing diagnostic logs for ${cleanDomain}...')" style="background:${accentColor}; color:#000; border:none; padding:10px 20px; border-radius:20px; font-weight:bold; cursor:pointer;">Run Diagnostics</button>
            <button onclick="window.navigate('dragon://search')" style="background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:10px 20px; border-radius:20px; cursor:pointer;">Search Web</button>
          </div>
        </div>
        
        <div>
          <!-- Right side panel -->
          <div class="glass-card" style="background:rgba(0,0,0,0.3); border-color:rgba(255,255,255,0.08); padding:20px; border-radius:12px; margin-bottom:20px;">
            <h3 style="color:#fff; margin-top:0;">Grid Status</h3>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.9rem;">
              <span style="color:#94a3b8;">System Load</span>
              <span style="color:#34d399; font-weight:bold;">${Math.floor(rand() * 40 + 10)}%</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.9rem;">
              <span style="color:#94a3b8;">Ledger Sync</span>
              <span style="color:#34d399; font-weight:bold;">Active</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
              <span style="color:#94a3b8;">Server Node</span>
              <span style="color:#38bdf8; font-weight:bold;">Node-${Math.floor(rand() * 90 + 10)}</span>
            </div>
          </div>
          
          <div class="glass-card" style="background:rgba(255,255,255,0.02); border-color:rgba(255,255,255,0.1); padding:20px; border-radius:12px;">
            <h3 style="color:#fff; margin-top:0;">Related Links</h3>
            <ul style="padding-left:20px; margin:0; font-size:0.95rem;">
              <li style="margin-bottom:10px;"><a href="#" onclick="window.navigate('dragon://wiki/Main_Page')" style="color:${accentColor};">DragonWiki Home</a></li>
              <li style="margin-bottom:10px;"><a href="#" onclick="window.navigate('dragon://tube')" style="color:${accentColor};">DragonTube Videos</a></li>
              <li><a href="#" onclick="window.navigate('dragon://weather')" style="color:${accentColor};">Weather Forecast</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- DRAGON TUBE (Direct MP4 Streams, Matched to Search Queries!) ---
function renderTube(base, query) {
  if (query.includes('v=')) {
    const videoParam = decodeURIComponent(query.split('v=')[1]);
    const term = videoParam.toLowerCase();

    // Map keywords to relevant stock MP4 video clips
    let mp4Url = 'https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-particles-background-1002-large.mp4'; // default abstract
    let categoryName = 'Special Interest';

    if (term.includes('cat') || term.includes('pet') || term.includes('animal') || term.includes('dog')) {
      mp4Url = 'https://assets.mixkit.co/videos/preview/mixkit-kitten-sleeping-on-a-fluffy-white-blanket-41712-large.mp4';
      categoryName = 'Cute Animals';
    } else if (term.includes('space') || term.includes('planet') || term.includes('universe') || term.includes('galaxy') || term.includes('star')) {
      mp4Url = 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4';
      categoryName = 'Science & Nature';
    } else if (term.includes('weather') || term.includes('rain') || term.includes('storm') || term.includes('cloud')) {
      mp4Url = 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-a-window-pane-1823-large.mp4';
      categoryName = 'Meteorology';
    } else if (term.includes('coin') || term.includes('dc') || term.includes('money') || term.includes('rich') || term.includes('gold')) {
      mp4Url = 'https://assets.mixkit.co/videos/preview/mixkit-spinning-gold-coin-on-black-background-48560-large.mp4';
      categoryName = 'Finance';
    } else if (term.includes('code') || term.includes('hack') || term.includes('cyber') || term.includes('matrix') || term.includes('net')) {
      mp4Url = 'https://assets.mixkit.co/videos/preview/mixkit-green-cyber-character-glowing-in-dark-40092-large.mp4';
      categoryName = 'Technology';
    } else if (term.includes('dragon') || term.includes('lizard') || term.includes('reptile') || term.includes('monster')) {
      mp4Url = 'https://assets.mixkit.co/videos/preview/mixkit-chameleon-on-a-branch-40120-large.mp4';
      categoryName = 'Reptilian Wildlife';
    } else if (term.includes('game') || term.includes('play') || term.includes('flappy') || term.includes('forest') || term.includes('nature')) {
      mp4Url = 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4';
      categoryName = 'Nature Loop';
    }

    // Capitalize term for title
    const displayTitle = videoParam.charAt(0).toUpperCase() + videoParam.slice(1);
    const title = displayTitle.length <= 2 ? `Video #${displayTitle}` : `All About "${displayTitle}"`;
    const desc = `A high quality, user-contributed stream exploring the concept of "${displayTitle.toLowerCase()}". Categorized under ${categoryName}.`;

    contentDiv.innerHTML = `
      <div class="dt-player-container">
        <div class="dt-header" style="margin-bottom: 20px; cursor:pointer;" onclick="window.navigate('dragon://tube')">
          <span style="color:red;">▶</span> DragonTube
        </div>
        <div style="position: relative; width: 100%; max-width: 800px; margin: 0 auto 20px auto; background: black; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1);">
          <video src="${mp4Url}" autoplay loop controls style="width: 100%; display: block;"></video>
        </div>
        <h1 style="font-size: 1.5rem; color: white;">${title}</h1>
        <p style="color:#aaa;">1.2M views • 2 days ago</p>
        <hr style="border-color:#333; margin:20px 0;">
        <p style="color:#eee;">${desc}</p>
      </div>
    `;
  } else {
    // Home
    contentDiv.innerHTML = `
      <div class="dt-header">
        <span style="color:red;">▶</span> DragonTube
      </div>
      <div class="dt-grid">
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=forest')">
          <div class="dt-thumb" style="background: linear-gradient(135deg, #1e1b4b, #311042);">🌳</div>
          <div class="dt-title">10 Hours of Flappy Dragon</div>
          <div class="dt-channel">ProGamer</div>
        </div>
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=cyber')">
          <div class="dt-thumb" style="background: linear-gradient(135deg, #450a0a, #780202);">🧬</div>
          <div class="dt-title">How to get infinite DC! (Not clickbait)</div>
          <div class="dt-channel">EconomyHax</div>
        </div>
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=space')">
          <div class="dt-thumb" style="background: linear-gradient(135deg, #022c22, #065f46);">🌌</div>
          <div class="dt-title">Reacting to YOUR Planets!</div>
          <div class="dt-channel">SpaceExplorer</div>
        </div>
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=fails')">
          <div class="dt-thumb" style="background: linear-gradient(135deg, #172554, #1e3a8a);">✨</div>
          <div class="dt-title">Global Jukebox Fail Compilation</div>
          <div class="dt-channel">FunnyClips</div>
        </div>
      </div>
    `;
  }
}

// --- DRAGON WIKI (Infinite Seeded Wiki Articles) ---
function renderWiki(base) {
  const article = base.split('/').pop() || 'Main_Page';
  const title = article.replace(/_/g, ' ');

  let contentHTML = '';
  
  if (article === 'Dragon_Coins') {
    contentHTML = `
      <h1 class="dw-header">Dragon Coins (DC)</h1>
      <div class="dw-infobox">
        <div style="background:#1e293b; text-align:center; padding:5px; font-weight:bold; color:white;">Dragon Coins</div>
        <div style="padding:10px; text-align:center;">
          <div style="font-size:4rem; margin-bottom:10px;">🪙</div>
          <i>The official currency of DrAg0n.</i>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem; color:#cbd5e1;">
          <tr style="border-top:1px solid rgba(255,255,255,0.1);"><td style="font-weight:bold; padding:4px;">Type</td><td style="padding:4px;">Virtual Currency</td></tr>
          <tr style="border-top:1px solid rgba(255,255,255,0.1);"><td style="font-weight:bold; padding:4px;">Earn Rate</td><td style="padding:4px;">High (Arcade)</td></tr>
          <tr style="border-top:1px solid rgba(255,255,255,0.1);"><td style="font-weight:bold; padding:4px;">Symbol</td><td style="padding:4px;">DC</td></tr>
        </table>
      </div>
      <p><b>Dragon Coins (DC)</b> (also colloquially referred to by users as *DragonBux*) is the primary currency used inside the DrAg0n ecosystem.</p>
      <p>Introduced in mid-2026, the currency allows users to purchase cosmetic upgrades and special privileges from the official **Dragon Shop**.</p>
      <h2>Earning Methods</h2>
      <p>Users can acquire Dragon Coins through multiple activities:</p>
      <ul>
        <li><b>Arcade Games:</b> Playing <a href="#" onclick="window.navigate('dragon://wiki/Flappy_Dragon')">Flappy Dragon</a> rewards 10 DC per pipe. Neon Snake rewards 4 DC per apple.</li>
        <li><b>Trivia:</b> Responding correctly to the TriviaBot in Animal Chat yields 150 DC.</li>
        <li><b>Daily Loyalty:</b> Logging in once every 24 hours awards a flat 100 DC.</li>
      </ul>
      <h2>Utility</h2>
      <p>Coins can be spent on various virtual items at the shop, including the Fire Avatar Border, custom chat colors, VIP badges, and floating companions like the **Pet Dragon** or **Pet Robot**.</p>
    `;
  } else if (article === 'Flappy_Dragon') {
    contentHTML = `
      <h1 class="dw-header">Flappy Dragon</h1>
      <div class="dw-infobox">
        <div style="background:#1e293b; text-align:center; padding:5px; font-weight:bold; color:white;">Flappy Dragon</div>
        <div style="padding:10px; text-align:center;">
          <div style="font-size:4rem; margin-bottom:10px;">🐉</div>
          <i>The classic side-scrolling game.</i>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem; color:#cbd5e1;">
          <tr style="border-top:1px solid rgba(255,255,255,0.1);"><td style="font-weight:bold; padding:4px;">Developer</td><td style="padding:4px;">DrAg0n Team</td></tr>
          <tr style="border-top:1px solid rgba(255,255,255,0.1);"><td style="font-weight:bold; padding:4px;">Genre</td><td style="padding:4px;">Arcade / Avoidance</td></tr>
          <tr style="border-top:1px solid rgba(255,255,255,0.1);"><td style="font-weight:bold; padding:4px;">Platform</td><td style="padding:4px;">HTML5 Canvas</td></tr>
        </table>
      </div>
      <p><b>Flappy Dragon</b> is a popular HTML5 arcade game integrated directly into the DrAg0n Arcade. Players control a flying dragon, attempting to navigate through gaps in green pipes without hitting the floor or the obstacles.</p>
      <h2>Gameplay</h2>
      <p>The game is played by clicking or tapping the game screen to trigger a vertical jump ("flap"). Gravity pulls the dragon down constantly. Success requires careful timing and spatial judgment.</p>
      <h2>Rewards</h2>
      <p>Players earn 5 XP and 10 DC instantly for every obstacle successfully passed, making it the most popular speed-farming method for currency on the platform.</p>
    `;
  } else if (article === 'Main_Page') {
    contentHTML = `
      <h1 class="dw-header">Welcome to DragonWiki!</h1>
      <p>Welcome to <b>DragonWiki</b>, the community-driven encyclopedia documenting the history, mechanics, currency, and architecture of the DrAg0n website!</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px;">
        <div style="background:rgba(255,255,255,0.03); padding:15px; border:1px solid rgba(255,255,255,0.1); border-radius:8px;">
          <h3>🪙 Economy</h3>
          <p>Read about the currency <a href="#" onclick="window.navigate('dragon://wiki/Dragon_Coins')">Dragon Coins</a> and what items you can buy at the shop.</p>
        </div>
        <div style="background:rgba(255,255,255,0.03); padding:15px; border:1px solid rgba(255,255,255,0.1); border-radius:8px;">
          <h3>🎮 Arcade</h3>
          <p>Explore games like <a href="#" onclick="window.navigate('dragon://wiki/Flappy_Dragon')">Flappy Dragon</a> and how they pay out rewards.</p>
        </div>
      </div>
    `;
  } else {
    // Procedural generation for ANY OTHER page (Infinite Pages!)
    const rand = getSeededRandom(article);
    const classifications = ["Quantum Phenomenon", "Virtual Mechanism", "Holographic Concept", "Secret Protocol", "Ancient Relic"];
    const classes = ["Class-A", "Class-IV", "Level-Max", "Secure-Alpha", "Experimental"];
    
    const openingSents = [
      `is a highly sought-after component located inside the core structure of the DrAg0n portal.`,
      `represents a unique virtual mechanic first introduced during the 2026 expansion.`,
      `stands as a legendary community symbol within the chat and arcade communities.`
    ];
    const middleSents = [
      `Experts believe that integrating this object with local DC assets creates an atmospheric shift in the planet generator.`,
      `According to local database records, its core functions are highly synchronized with the daily unlock passwords.`,
      `Multiple users have reported discovering hidden tokens near this anomaly during space exploration runs.`
    ];
    
    contentHTML = `
      <h1 class="dw-header">${title}</h1>
      <div class="dw-infobox">
        <div style="background:#1e293b; text-align:center; padding:5px; font-weight:bold; color:white;">${title}</div>
        <div style="padding:10px; text-align:center;">
          <div style="font-size:4rem; margin-bottom:10px;">🔮</div>
          <i>A virtual projection.</i>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem; color:#cbd5e1;">
          <tr style="border-top:1px solid rgba(255,255,255,0.1);"><td style="font-weight:bold; padding:4px;">Classification</td><td style="padding:4px;">${seededPick(classifications, rand)}</td></tr>
          <tr style="border-top:1px solid rgba(255,255,255,0.1);"><td style="font-weight:bold; padding:4px;">Threat Level</td><td style="padding:4px;">${seededPick(classes, rand)}</td></tr>
        </table>
      </div>
      <p><b>${title}</b> ${seededPick(openingSents, rand)}</p>
      <p>${seededPick(middleSents, rand)} The anomaly remains under surveillance by the main systems.</p>
      <h2>Research & History</h2>
      <p>Historians argue that ${title.toLowerCase()} was created to optimize data flow across the Tiny Internet browser. It is fully cataloged under section ${Math.floor(rand() * 9000 + 1000)} of the database registers.</p>
    `;
  }

  contentDiv.innerHTML = `
    <div class="fake-site" style="background:#090d16; min-height: 100vh;">
      <div style="display:flex; align-items:center; gap:10px; padding: 20px 40px; background: #0b0f19; border-bottom: 1px solid rgba(255,255,255,0.1); cursor:pointer;" onclick="window.navigate('dragon://wiki/Main_Page')">
        <span style="font-size:2rem;">🌐</span>
        <strong style="font-size:1.5rem; font-family:serif;">DragonWiki</strong>
      </div>
      
      <div class="dw-content" style="margin-top:20px;">
        ${contentHTML}
      </div>
    </div>
  `;
}

// --- DRAGON NEWS (Infinite Procedural News Articles) ---
function renderNews(base) {
  const article = base.split('/').pop();
  
  if (article && article !== 'news') {
    // Generate a unique seeded news article
    const rand = getSeededRandom(article);
    const headlines = [
      "MYSTERIOUS ANOMALY DISCOVERED IN COMMUNITY WHITEBOARD",
      "NEW MOONS DETECTED ORBITING LOCAL VISITOR PLANETS",
      "ECONOMY IN TRANSIT: COIN DEMAND HITS RECORD HIGHS",
      "LOCAL PROGRAMMER UNLOCKS GOLDEN AVATAR"
    ];
    const headline = headlines[parseInt(article.replace('article-', '')) % headlines.length] || "BREAKING NEWS FROM THE DIGITAL SECTOR";
    
    contentDiv.innerHTML = `
      <div class="fake-site" style="background:#090d16; min-height:100vh; color:#e2e8f0;">
        <div class="dn-header" style="cursor:pointer; border-color:rgba(255,255,255,0.1);" onclick="window.navigate('dragon://news')">
          <h1 class="dn-title">The Daily Dragon</h1>
          <div class="dn-date">Providing truth to the digital realm since yesterday.</div>
        </div>
        <h1 class="dn-headline">${headline}</h1>
        <div class="dn-article" style="color:#cbd5e1;">
          <p>Early reports this morning indicate that section ${Math.floor(rand() * 500 + 1)} of the grid has experienced high levels of virtual activity.</p>
          <p>"It was totally unexpected," an observer commented. "One minute everything was normal, and the next we had digital patterns repeating all over the place."</p>
          <p>Local authorities are recommending that all users update their profile settings and secure their balances immediately at the shop.</p>
          <p>We will continue tracking this development as more data comes online. <a href="#" onclick="window.navigate('dragon://wiki/Main_Page')">Read more analysis...</a></p>
        </div>
      </div>
    `;
  } else {
    // news landing page
    contentDiv.innerHTML = `
      <div class="fake-site" style="background:#090d16; min-height:100vh; color:#e2e8f0;">
        <div class="dn-header" style="border-color:rgba(255,255,255,0.1);">
          <h1 class="dn-title">The Daily Dragon</h1>
          <div class="dn-date">Providing truth to the digital realm since yesterday.</div>
        </div>
        
        <div style="max-width:800px; margin: 0 auto; display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
          <div>
            <div style="width:100%; height:250px; background:linear-gradient(45deg, #1e1b4b, #311042); border-radius:12px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; font-size:4rem;">📰</div>
            <h2 style="font-family:serif; font-size:2rem;"><a href="#" onclick="window.navigate('dragon://news/article-1')" style="color:#38bdf8; text-decoration:none;">MYSTERIOUS ANOMALY DISCOVERED</a></h2>
            <p style="font-family:serif; color:#cbd5e1;">Grid calculations went wild today as local administrators noticed unusual logs...</p>
          </div>
          <div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:10px;">
              <h3 style="font-family:serif; margin:0;"><a href="#" onclick="window.navigate('dragon://news/article-2')" style="color:#38bdf8; text-decoration:none;">New Moons Detected</a></h3>
              <p style="font-family:serif; margin:5px 0; color:#94a3b8;">Astronomers observe procedurally generated clusters.</p>
            </div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:10px;">
              <h3 style="font-family:serif; margin:0;"><a href="#" onclick="window.navigate('dragon://news/article-3')" style="color:#38bdf8; text-decoration:none;">Coin Demand Hits Highs</a></h3>
              <p style="font-family:serif; margin:5px 0; color:#94a3b8;">Shop items are flying off the shelves as players pool DC.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// --- DRAGON WEATHER (Infinite Seeded Weather Generator) ---
function renderWeather(base, query) {
  let location = "Dragon City";
  if (query.includes('loc=')) {
    location = decodeURIComponent(query.split('loc=')[1]);
  }
  
  // Seeded values based on weather location!
  const rand = getSeededRandom(location);
  const temp = Math.floor(rand() * 450 - 50); // -50C to 400C!
  
  const conditions = ["Heavy Meteor Showers", "Acidic Rainfall", "Molten Solar Flare", "Solar Wind Storms", "Supercooled Freezing Fog", "Pleasant Neon Calm"];
  const cond = seededPick(conditions, rand);
  
  const icons = {
    "Heavy Meteor Showers": "☄️",
    "Acidic Rainfall": "🌧️",
    "Molten Solar Flare": "🔥",
    "Solar Wind Storms": "💨",
    "Supercooled Freezing Fog": "🌫️",
    "Pleasant Neon Calm": "☀️"
  };
  const icon = icons[cond] || "☀️";

  contentDiv.innerHTML = `
    <div class="fake-site dwx-bg">
      <div style="font-size: 5rem;">${icon}</div>
      <h1 style="font-size: 3rem; margin:0; text-transform: capitalize;">${location}</h1>
      <div class="dwx-temp">${temp}°C</div>
      <div class="dwx-desc">${cond}</div>
      <p style="font-size: 1.2rem; margin-top:20px; opacity:0.8;">
        Wind: ${Math.floor(rand() * 300)} km/h | Humidity: ${Math.floor(rand() * 100)}% | Visibility: ${rand() > 0.5 ? "Poor" : "Excellent"}
      </p>
      <div style="margin-top: 50px; display:flex; justify-content:center; gap:20px;">
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); padding:20px; border-radius:10px; width:100px;">
          <div>Tomorrow</div>
          <div style="font-size:2rem; margin:10px 0;">🌋</div>
          <div>${temp + 10}°C</div>
        </div>
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); padding:20px; border-radius:10px; width:100px;">
          <div>Next Day</div>
          <div style="font-size:2rem; margin:10px 0;">❄️</div>
          <div>${temp - 20}°C</div>
        </div>
      </div>
    </div>
  `;
}

// Init
navigate('dragon://search');
