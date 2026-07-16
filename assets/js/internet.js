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
  } else if (base.startsWith('dragon://ai')) {
    renderAI(base, query);
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

    // Extract core query word to generate cleaner headlines (e.g. remove "news article")
    let topicName = searchVal.replace(/\bnews\b/gi, '').replace(/\barticle\b/gi, '').trim();
    if (!topicName) topicName = searchVal;

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
          <a href="#" onclick="window.navigate('dragon://weather?loc=' + encodeURIComponent('${topicName}'))" class="ds-link">Local Weather Forecast for ${topicName}</a>
          <div class="ds-desc">Is it safe to fly in ${topicName} today? Check the latest atmospheric conditions...</div>
        </div>
      `);
    }

    // 2. Dynamic News Article Result (Fulfills the "Cannibal hannibal news article" request!)
    let newsId = encodeURIComponent(topicName);
    matches.push(`
      <div class="ds-result">
        <div style="color: #f43f5e; font-size: 0.85rem; margin-bottom: 2px;">dragon://news/article-${newsId}</div>
        <a href="#" onclick="window.navigate('dragon://news/article-${newsId}')" class="ds-link">The Daily Dragon: Breaking News on "${topicName}"</a>
        <div class="ds-desc">Read the full, detailed news coverage regarding "${topicName}". Shocking details and community reactions inside.</div>
      </div>
    `);

    // 3. Dynamic Video Result
    let videoId = encodeURIComponent(topicName);
    matches.push(`
      <div class="ds-result">
        <a href="#" onclick="window.navigate('dragon://tube/watch?v=${videoId}')" class="ds-link">DragonTube: Trending Video on "${topicName}"</a>
        <div class="ds-desc">Stream this real video covering "${topicName}" directly inside the browser. No YouTube player required.</div>
      </div>
    `);

    // 4. Dynamic Infinite Website Matches
    const cleanDomain = topicName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanDomain) {
      const domains = [
        `www.${cleanDomain}planet.dragon`,
        `the${cleanDomain}hub.dragon`,
        `www.${cleanDomain}defense.dragon`
      ];
      const randDom = getSeededRandom(cleanDomain);
      const domainSelected = seededPick(domains, randDom);
      matches.push(`
        <div class="ds-result">
          <div style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 2px;">http://${domainSelected}</div>
          <a href="#" onclick="window.navigate('http://${domainSelected}')" class="ds-link">${topicName.charAt(0).toUpperCase() + topicName.slice(1)} Portal - Official Site</a>
          <div class="ds-desc">Welcome to the official community gateway for ${topicName.toLowerCase()}. Explore forums, download resources, and chat with local users.</div>
        </div>
      `);
    }

    // 5. Procedural Wiki Matches
    const rand = getSeededRandom(topicName);
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
      <div style="text-align: center; margin-top: 10px; margin-bottom: 20px;">
        <span style="font-size: 0.95rem; color: #c084fc; filter: drop-shadow(0 0 5px rgba(168,85,247,0.3));">✨ Try the new </span>
        <a href="#" onclick="window.navigate('dragon://ai')" style="color: #a855f7; font-weight: bold; text-decoration: underline;">DragonAI Story Writer</a>
        <span style="font-size: 0.95rem; color: #c084fc;"> to generate unique, formal stories for any prompt!</span>
      </div>
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

  // Keyword check for interactive widgets and custom logos
  const term = cleanDomain.toLowerCase();
  const isHannibal = term.includes('cannibal') || term.includes('hannibal') || term.includes('eat') || term.includes('food') || term.includes('cook');
  const isSpace = term.includes('space') || term.includes('planet') || term.includes('universe') || term.includes('galaxy') || term.includes('star') || term.includes('moon');
  const isFinance = term.includes('coin') || term.includes('dc') || term.includes('money') || term.includes('rich') || term.includes('gold') || term.includes('shop') || term.includes('buy') || term.includes('bank');
  const isWeather = term.includes('weather') || term.includes('rain') || term.includes('storm') || term.includes('cloud') || term.includes('temp') || term.includes('wind');
  const isGame = term.includes('game') || term.includes('play') || term.includes('flappy') || term.includes('snake') || term.includes('arcade') || term.includes('score');

  let logoEmoji = "🌀";
  let widgetHTML = "";

  if (isHannibal) {
    logoEmoji = "🥩";
    widgetHTML = `
      <div style="margin-top:20px; padding:15px; background:rgba(220,38,38,0.05); border:1px solid rgba(220,38,38,0.2); border-radius:10px;">
        <h4 style="margin:0 0 10px 0; color:#f87171;">🍽️ Gourmet Recipe Generator</h4>
        <p style="font-size:0.9rem; color:#fca5a5; margin-bottom:15px;">Simulate a custom recipe curated by the doctor.</p>
        <button onclick="
          const meats = ['Truffle Infused Void-Gel', 'Chameleon Filet', 'Cybernetic Ribeye', 'Slow-cooked database registry'];
          const sauces = ['FBI Red Reduction', 'Chianti Wine Glaze', 'Acid Rain Jus', 'Daily Password Reduction'];
          const sides = ['fava beans', 'braised binary chips', 'sauteed memory nodes', 'procedural truffles'];
          const r = Math.floor(Math.random() * 4);
          const recipe = meats[r] + ' served with a rich ' + sauces[Math.floor(Math.random() * 4)] + ' and a side of ' + sides[Math.floor(Math.random() * 4)] + '.';
          alert('Gourmet Recipe: ' + recipe);
        " style="background:#dc2626; color:#fff; border:none; padding:8px 15px; border-radius:15px; font-weight:bold; cursor:pointer; font-size:0.85rem;">Generate Recipe</button>
      </div>
    `;
  } else if (isSpace) {
    logoEmoji = "🚀";
    widgetHTML = `
      <div style="margin-top:20px; padding:15px; background:rgba(56,189,248,0.05); border:1px solid rgba(56,189,248,0.2); border-radius:10px;">
        <h4 style="margin:0 0 10px 0; color:#38bdf8;">🛰️ Sector Coordinates Scanner</h4>
        <p style="font-size:0.9rem; color:#bae6fd; margin-bottom:15px;">Scan nearby orbits for rogue asteroids and anomalies.</p>
        <button onclick="
          const x = Math.floor(Math.random() * 9999);
          const y = Math.floor(Math.random() * 9999);
          const z = Math.floor(Math.random() * 9999);
          alert('Scanner Active... Found anomaly at sector: [' + x + ', ' + y + ', ' + z + '] - Threat level: ' + ['Low', 'Moderate', 'High', 'Omega'][Math.floor(Math.random()*4)]);
        " style="background:#0284c7; color:#fff; border:none; padding:8px 15px; border-radius:15px; font-weight:bold; cursor:pointer; font-size:0.85rem;">Scan Orbit</button>
      </div>
    `;
  } else if (isFinance) {
    logoEmoji = "💰";
    widgetHTML = `
      <div style="margin-top:20px; padding:15px; background:rgba(234,179,8,0.05); border:1px solid rgba(234,179,8,0.2); border-radius:10px;">
        <h4 style="margin:0 0 10px 0; color:#eab308;">📈 DC Investment Calculator</h4>
        <p style="font-size:0.9rem; color:#fef08a; margin-bottom:15px;">Project compound growth inside the DrAg0n virtual treasury.</p>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <input type="number" id="dc-invest-amt" placeholder="DC Amount" value="100" style="width:100px; padding:5px; border-radius:5px; border:1px solid #eab308; background:#000; color:#fff; outline:none;">
          <button onclick="
            const amt = parseFloat(document.getElementById('dc-invest-amt').value) || 0;
            const growth = Math.floor(amt * 1.54);
            alert('In 30 solar cycles, your ' + amt + ' DC will compound to approximately ' + growth + ' DC! (54% Est. Yield)');
          " style="background:#ca8a04; color:#fff; border:none; padding:5px 12px; border-radius:5px; font-weight:bold; cursor:pointer; font-size:0.85rem;">Calculate</button>
        </div>
      </div>
    `;
  } else if (isWeather) {
    logoEmoji = "⚡";
    widgetHTML = `
      <div style="margin-top:20px; padding:15px; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); border-radius:10px;">
        <h4 style="margin:0 0 10px 0; color:#10b981;">🌪️ Real-Time Wind Speed Monitor</h4>
        <p style="font-size:0.9rem; color:#a7f3d0; margin-bottom:15px;">Live atmospheric velocity measurements.</p>
        <div style="font-size:1.8rem; font-weight:bold; color:#34d399; margin-bottom:10px;" id="live-wind-speed">${Math.floor(Math.random() * 200 + 50)} km/h</div>
        <button onclick="
          const sp = Math.floor(Math.random() * 250 + 50);
          document.getElementById('live-wind-speed').innerText = sp + ' km/h';
        " style="background:#059669; color:#fff; border:none; padding:8px 15px; border-radius:15px; font-weight:bold; cursor:pointer; font-size:0.85rem;">Update Sensor</button>
      </div>
    `;
  } else if (isGame) {
    logoEmoji = "🎮";
    widgetHTML = `
      <div style="margin-top:20px; padding:15px; background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.2); border-radius:10px;">
        <h4 style="margin:0 0 10px 0; color:#c084fc;">🏆 Hall of Fame Submitter</h4>
        <p style="font-size:0.9rem; color:#e9d5ff; margin-bottom:15px;">Submit your name to enter the local portal ranks.</p>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <input type="text" id="arcade-sub-name" placeholder="Username" style="width:120px; padding:5px; border-radius:5px; border:1px solid #c084fc; background:#000; color:#fff; outline:none;">
          <button onclick="
            const name = document.getElementById('arcade-sub-name').value || 'Anonymous';
            alert('Congratulations ' + name + '! You have been registered in the Hall of Fame at rank #' + Math.floor(Math.random() * 10 + 2) + '!');
          " style="background:#9333ea; color:#fff; border:none; padding:5px 12px; border-radius:5px; font-weight:bold; cursor:pointer; font-size:0.85rem;">Submit</button>
        </div>
      </div>
    `;
  } else {
    // Default general site widget
    logoEmoji = "🌀";
    widgetHTML = `
      <div style="margin-top:20px; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px;">
        <h4 style="margin:0 0 10px 0; color:#fff;">💻 System Sandbox Console</h4>
        <p style="font-size:0.9rem; color:#ccc; margin-bottom:15px;">Execute a sandbox query protocol.</p>
        <button onclick="
          const cmds = ['GET /sys/status HTTP/1.1\\n200 OK', 'SYNC ledger_db... Done.', 'BYPASS password_modal... Failed.', 'DECRYPT void_crystal... Access Denied.'];
          alert('Console Output:\\n' + cmds[Math.floor(Math.random() * cmds.length)]);
         " style="background:rgba(255,255,255,0.15); color:#fff; border:1px solid rgba(255,255,255,0.3); padding:8px 15px; border-radius:15px; font-weight:bold; cursor:pointer; font-size:0.85rem;">Execute Command</button>
      </div>
    `;
  }

  // Draw the custom website content
  contentDiv.innerHTML = `
    <div class="fake-site" style="background:${bgGradient}; min-height:100vh; color:#e2e8f0; font-family:'Outfit', sans-serif;">
      <!-- Web site header banner -->
      <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 30px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:2.2rem; color:${accentColor}; margin:0; text-shadow: 0 0 20px rgba(255,255,255,0.1); text-transform:capitalize;">${cleanDomain} Portal</h1>
          <span style="color:#94a3b8; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px;">${type}</span>
        </div>
        <div style="font-size: 2.5rem; filter: drop-shadow(0 0 10px ${accentColor});">${logoEmoji}</div>
      </div>

      <!-- Navigation Bar -->
      <nav style="display:flex; gap:20px; margin-bottom: 30px; font-size:0.9rem; font-weight:600; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
        <a href="#" onclick="alert('Already at Home.')" style="color:${accentColor}; text-decoration:none;">Home</a>
        <a href="#" onclick="alert('Accessing database... Connection timed out.')" style="color:#94a3b8; text-decoration:none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Database</a>
        <a href="#" onclick="alert('Portals are temporarily closed for maintenance.')" style="color:#94a3b8; text-decoration:none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Portals</a>
        <a href="#" onclick="alert('Help documentation is available on DragonWiki.')" style="color:#94a3b8; text-decoration:none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Help</a>
      </nav>
      
      <!-- Content columns -->
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:30px;">
        <div class="glass-card" style="background:rgba(255,255,255,0.02); border-color:rgba(255,255,255,0.1); padding:25px; border-radius:12px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">
          <h2 style="color:${accentColor}; margin-top:0; font-size: 1.6rem;">${welcome}</h2>
          <p style="font-size:1.1rem; line-height:1.6; color:#cbd5e1;">${p1}</p>
          <p style="font-size:1.1rem; line-height:1.6; color:#cbd5e1;">${p2}</p>

          <!-- Injected Interactive Widget -->
          ${widgetHTML}
          
          <div style="margin-top: 30px; display:flex; gap:10px;">
            <button onclick="alert('Accessing diagnostic logs for ${cleanDomain}... All systems check.')" style="background:${accentColor}; color:#000; border:none; padding:10px 20px; border-radius:20px; font-weight:bold; cursor:pointer; box-shadow: 0 0 15px ${accentColor}; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Run Diagnostics</button>
            <button onclick="window.navigate('dragon://search')" style="background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:10px 20px; border-radius:20px; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">Search Web</button>
          </div>
        </div>
        
        <div>
          <!-- Right side panel -->
          <div class="glass-card" style="background:rgba(0,0,0,0.3); border-color:rgba(255,255,255,0.08); padding:20px; border-radius:12px; margin-bottom:20px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);">
            <h3 style="color:#fff; margin-top:0; font-size:1.2rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Grid Status</h3>
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.9rem;">
              <span style="color:#94a3b8;">System Load</span>
              <span style="color:#34d399; font-weight:bold;">${Math.floor(rand() * 40 + 10)}%</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.9rem;">
              <span style="color:#94a3b8;">Ledger Sync</span>
              <span style="color:#34d399; font-weight:bold;">Active</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
              <span style="color:#94a3b8;">Server Node</span>
              <span style="color:#38bdf8; font-weight:bold;">Node-${Math.floor(rand() * 90 + 10)}</span>
            </div>
          </div>
          
          <div class="glass-card" style="background:rgba(255,255,255,0.02); border-color:rgba(255,255,255,0.1); padding:20px; border-radius:12px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);">
            <h3 style="color:#fff; margin-top:0; font-size:1.2rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Related Links</h3>
            <ul style="padding-left:20px; margin:0; font-size:0.95rem; line-height: 1.8;">
              <li style="margin-bottom:8px;"><a href="#" onclick="window.navigate('dragon://wiki/Main_Page')" style="color:${accentColor}; text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">DragonWiki Home</a></li>
              <li style="margin-bottom:8px;"><a href="#" onclick="window.navigate('dragon://tube')" style="color:${accentColor}; text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">DragonTube Videos</a></li>
              <li><a href="#" onclick="window.navigate('dragon://weather')" style="color:${accentColor}; text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">Weather Forecast</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer style="margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.08); padding-top:20px; text-align:center; font-size:0.8rem; color:#64748b;">
        &copy; 2026 ${cleanDomain.toUpperCase()} Corp. All virtual registers synced. Secured by Tiny Internet Protocol.
      </footer>
    </div>
  `;
}

// --- DRAGON TUBE (Direct MP4 Streams, Matched to Search Queries!) ---
function renderTube(base, query) {
  if (query.includes('v=')) {
    const videoParam = decodeURIComponent(query.split('v=')[1]);
    const term = videoParam.toLowerCase();

    let mp4Url = 'https://vjs.zencdn.net/v/oceans.mp4';
    let categoryName = 'Special Interest';

    if (term.includes('cat') || term.includes('pet') || term.includes('animal') || term.includes('dog') || term.includes('bunny')) {
      mp4Url = 'https://www.w3schools.com/html/mov_bbb.mp4';
      categoryName = 'Cute Animals';
    } else if (term.includes('space') || term.includes('planet') || term.includes('universe') || term.includes('galaxy') || term.includes('star') || term.includes('ocean') || term.includes('sea') || term.includes('water')) {
      mp4Url = 'https://vjs.zencdn.net/v/oceans.mp4';
      categoryName = 'Oceanic Space';
    } else if (term.includes('weather') || term.includes('rain') || term.includes('storm') || term.includes('cloud') || term.includes('flower') || term.includes('nature') || term.includes('forest') || term.includes('garden')) {
      mp4Url = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
      categoryName = 'Nature & Weather';
    } else if (term.includes('dragon') || term.includes('lizard') || term.includes('reptile') || term.includes('monster') || term.includes('bear') || term.includes('wild')) {
      mp4Url = 'https://www.w3schools.com/html/movie.mp4';
      categoryName = 'Wildlife';
    } else {
      const urlList = [
        'https://vjs.zencdn.net/v/oceans.mp4',
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        'https://www.w3schools.com/html/mov_bbb.mp4',
        'https://www.w3schools.com/html/movie.mp4'
      ];
      mp4Url = urlList[term.length % urlList.length];
      categoryName = 'Generative Content';
    }

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
    // Generate a unique seeded news article (Fulfilling custom detailed articles!)
    const articleName = decodeURIComponent(article.replace('article-', '')).trim();
    
    if (articleName === '1' || articleName === '2' || articleName === '3') {
      // Return static articles
      const rand = getSeededRandom(articleName);
      const headlines = [
        "MYSTERIOUS ANOMALY DISCOVERED IN COMMUNITY WHITEBOARD",
        "NEW MOONS DETECTED ORBITING LOCAL VISITOR PLANETS",
        "ECONOMY IN TRANSIT: COIN DEMAND HITS RECORD HIGHS"
      ];
      const headline = headlines[parseInt(articleName) - 1] || "BREAKING NEWS FROM THE DIGITAL SECTOR";
      
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
      return;
    }

    // Procedural generation of a VERY detailed multi-paragraph news article (Seeded!)
    const rand = getSeededRandom(articleName);
    const displayTitle = articleName.charAt(0).toUpperCase() + articleName.slice(1);
    const term = articleName.toLowerCase();

    // Default general templates
    let intros = [
      `A critical situation has developed regarding **${displayTitle}**, sending shockwaves throughout the local sector.`,
      `Sensational reports surrounding **${displayTitle}** have triggered emergency meetings among site developers and active users alike.`,
      `A bizarre series of logs tracking **${displayTitle}** has been confirmed by lead engineers early this morning.`
    ];
    let details = [
      `Eyewitnesses in the chat lobby reported seeing strange characters appearing shortly after the event was registered. "It was like nothing we've seen since the database split of 2026," stated a long-time member.`,
      `Speculators have begun tracking potential correlation between the activity and local coin earn rates. Several nodes registered a sudden, unexplained spike in Flappy Dragon activity during the exact same timeframe.`,
      `Official warnings advise users to monitor their balances closely. Diagnostic tools are running at full load to ensure that ledger security remains intact throughout the current node cycle.`
    ];
    let outcomes = [
      `Security units have been deployed to sandbox ${displayTitle.toLowerCase()} until further notice. Authorities urge calm while calculations compile.`,
      `Initial investigations suggest a possible link to password modal logs. A patch is scheduled to deploy at node midnight.`,
      `Users are requested to report any anomalies or code drops directly inside the Animal Chat room to aid coordinates mapping.`
    ];

    // Theme matching based on keywords!
    if (term.includes('cannibal') || term.includes('hannibal') || term.includes('eat') || term.includes('food') || term.includes('cook') || term.includes('flesh')) {
      intros = [
        `A highly disturbing culinary investigation has been launched regarding **${displayTitle}**, shocking food critics across the grid.`,
        `Sensational reports surrounding the exotic taste profiles of **${displayTitle}** have triggered emergency health inspections in the lower sector.`,
        `Fears of clandestine kitchen operations related to **${displayTitle}** have been confirmed by law enforcement officers early this morning.`
      ];
      details = [
        `Inspectors discovered highly unusual menus containing custom gourmet recipes that seem to violate standard safety registers. "The flavor profile is incredibly sophisticated, but the source of the protein remains unidentified," noted a forensic specialist.`,
        `Speculators suggest the mysterious dinner parties were hosted by a brilliant local doctor under FBI surveillance. Several guests reported a strange sense of memory loss shortly after dessert was served.`,
        `Official warnings advise citizens to refuse invitations to private tasting events. Several culinary databases are running full diagnostics to locate the origin of the gourmet menu drops.`
      ];
      outcomes = [
        `Special forces have sealed off the local kitchen sandbox until further notice. Authorities warn that anyone attempting to download the recipes will have their profile locked.`,
        `Investigations suggest a possible link to a psychiatrist who escaped custody. A patch to the lobby security locks has been deployed at node midnight.`,
        `Users are requested to report any strange tasting invites or weird gourmet code drops directly inside the Animal Chat room.`
      ];
    } else if (term.includes('space') || term.includes('planet') || term.includes('alien') || term.includes('universe') || term.includes('star') || term.includes('galaxy') || term.includes('moon')) {
      intros = [
        `Astronomers have detected high-frequency orbital anomalies originating from **${displayTitle}**, sending cosmic research units into high alert.`,
        `Sensational interstellar reports surrounding **${displayTitle}** have triggered emergency deep-space scans from the observatory.`,
        `A mysterious cosmic cloud tracking **${displayTitle}** has been confirmed by lead navigation pilots early this morning.`
      ];
      details = [
        `Telescopes registered a massive energy surge within the local coordinate grid. "We are seeing planetary rotation cycles speed up by 400%, which shouldn't be physically possible," explained a stellar researcher.`,
        `Speculators believe a nearby hyper-gravitational collapse is drawing asteroid fields directly toward the generator. Several sectors reported witnessing meteor showers lighting up the sky.`,
        `Official warnings advise pilots to secure their spacecraft immediately. Space navigation systems are running at maximum capacity to avoid drifting into the gravitational well.`
      ];
      outcomes = [
        `Cosmic security units have sandboxed the affected coordinates until further notice. Celestial computations are compiling to predict the orbital trajectory.`,
        `Astronomers suggest the phenomenon might be linked to a newborn star system. A grid patch is scheduled to deploy at node midnight.`,
        `Users are requested to report any unidentified flying objects or cosmic radiation leaks directly inside the Space Explorer dashboard.`
      ];
    } else if (term.includes('coin') || term.includes('dc') || term.includes('money') || term.includes('rich') || term.includes('gold') || term.includes('shop') || term.includes('buy') || term.includes('bank')) {
      intros = [
        `A massive ledger surge has been registered regarding **${displayTitle}**, triggering emergency economic assessments.`,
        `Sensational financial reports surrounding **${displayTitle}** have sparked high-volume trading panics inside the local shop sector.`,
        `A sudden currency transfer involving **${displayTitle}** has been flagged by automated treasury audits early this morning.`
      ];
      details = [
        `Auditors discovered millions of gold coins flowing through undocumented terminals. "We are looking at unprecedented levels of coin farming that could completely destabilize shop pricing," reported a bank representative.`,
        `Speculators suggest a single local dragon has cornered the market on VIP badges and avatar borders, locking up the community capital. Trading volumes hit all-time highs within the hour.`,
        `Official warnings advise users to lock their virtual vaults. Diagnostic tools are tracing the ledger records to check for transaction leaks.`
      ];
      outcomes = [
        `Treasury codes have been temporarily sandboxed until the audit is complete. Authorities assure that shop item prices will remain pegged to standard rates.`,
        `Economists suggest a patch to the coin payout multiplier will deploy at node midnight. DC balances are secure.`,
        `Users are requested to report any ledger discrepancies or double-payout glitches directly inside the shop portal.`
      ];
    } else if (term.includes('weather') || term.includes('rain') || term.includes('storm') || term.includes('cloud') || term.includes('temp') || term.includes('wind')) {
      intros = [
        `Severe atmospheric pressure drops have been registered around **${displayTitle}**, prompting immediate storm evacuations.`,
        `Sensational weather patterns surrounding **${displayTitle}** have triggered emergency warnings from the climate desk.`,
        `A massive storm system tracking **${displayTitle}** has been confirmed by satellite telemetry early this morning.`
      ];
      details = [
        `Meteorologists reported acidic precipitation levels rising rapidly near the grid borders. "We are recording wind speeds surpassing 300 km/h, which poses an extreme threat to flying dragons," warned a radar officer.`,
        `Speculators believe a solar flare collision is superheating the lower atmosphere, vaporizing local moisture levels. Temperature readings peaked at record levels.`,
        `Official warnings advise all users to remain indoors. Weather stations are running full diagnostic scans to track the movement of the storm front.`
      ];
      outcomes = [
        `Atmospheric sandboxes have been initialized to dissipate the heat dome. Air traffic remains grounded until further notice.`,
        `Climatologists suggest the weather front will clear by tomorrow afternoon. A grid environmental update will deploy at node midnight.`,
        `Users are requested to report any microburst occurrences or meteor impacts directly to the weather station.`
      ];
    } else if (term.includes('game') || term.includes('play') || term.includes('flappy') || term.includes('snake') || term.includes('arcade') || term.includes('score')) {
      intros = [
        `A competitive database breach has been registered regarding **${displayTitle}**, shaking up the weekly arcade leaderboards.`,
        `Sensational high-score runs surrounding **${displayTitle}** have triggered emergency score-validation reviews.`,
        `A bizarre gameplay technique involving **${displayTitle}** has been flagged by lobby referees early this morning.`
      ];
      details = [
        `Referees confirmed a local player completed an entire run without registering a single collision frame. "The precision is mechanical; we are checking if the inputs were automated," stated an arcade host.`,
        `Speculators suggest players are forming secret factions to pool XP and manipulate the top tier ranks, locked out of average reach. Lobby traffic reached record density today.`,
        `Official warnings advise competitive players to review the tournament guidelines. Diagnostic checkers are monitoring active play sessions in real-time.`
      ];
      outcomes = [
        `The affected arcade leaderboards have been sandboxed until validation finishes. High scores are temporarily frozen.`,
        `Lobby hosts suggest a security update targeting input delays will deploy at node midnight.`,
        `Users are requested to report any physics glitches or abnormal score updates directly in the Arcade chat.`
      ];
    }

    contentDiv.innerHTML = `
      <div class="fake-site" style="background:#090d16; min-height:100vh; color:#e2e8f0; font-family:'Times New Roman', serif;">
        <!-- Newspaper Header -->
        <div class="dn-header" style="cursor:pointer; border-color:rgba(255,255,255,0.15);" onclick="window.navigate('dragon://news')">
          <h1 class="dn-title" style="font-size:3.5rem; letter-spacing: 2px;">The Daily Dragon</h1>
          <div class="dn-date" style="font-style:italic; font-size:0.9rem; margin-top:5px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Special Investigation Report &bull; Monday Bulletin</div>
        </div>
        
        <!-- Large Headline -->
        <h1 class="dn-headline" style="font-size: 2.8rem; font-weight:800; line-height:1.1; margin: 20px 0 30px 0; text-transform:uppercase; letter-spacing:-0.5px;">
          CRITICAL SECTOR REPORT: THE SHOCKING TRUTH BEHIND "${displayTitle.toUpperCase()}"
        </h1>
        
        <!-- Three Column News Article -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:30px; line-height:1.6; font-size:1.05rem; text-align:justify; color:#e2e8f0;">
          <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right:15px;">
            <p><span style="font-size:3rem; float:left; line-height:0.8; font-weight:bold; margin-right:8px; color:#38bdf8;">T</span>${seededPick(intros, rand)}</p>
            <p>Local sensors confirmed that unusual patterns began propagating at coordinates ${Math.floor(rand() * 900 + 100)} shortly after midnight. Early telemetry indicators suggest a substantial node overlap in the system framework.</p>
          </div>
          <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right:15px;">
            <p>${seededPick(details, rand)}</p>
            <p>Economists from the Dragon Shop reported that transaction speeds remained surprisingly stable despite the local news panic. "We are keeping a close eye on it," said the lead merchant.</p>
          </div>
          <div>
            <p>${seededPick(outcomes, rand)}</p>
            <p style="font-weight:bold; font-style:italic; border-top:1px solid rgba(255,255,255,0.15); padding-top:15px; margin-top:20px; color:#94a3b8;">
              Reported by J. Dragon, Tech Desk. For further research, check the wiki article for <a href="#" onclick="window.navigate('dragon://wiki/${displayTitle.replace(/ /g, '_')}')" style="color:#38bdf8; text-decoration:underline;">${displayTitle}</a>.
            </p>
          </div>
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

// --- DRAGONAI STORY WRITER (Infinite Story Compiler!) ---
function renderAI(base, query) {
  let promptVal = '';
  if (query && query.includes('p=')) {
    promptVal = decodeURIComponent(query.split('p=')[1].split('&')[0].replace(/\+/g, ' ')).trim();
  }

  if (promptVal) {
    // Show spinner and then trigger story loader
    contentDiv.innerHTML = `
      <div class="fake-site" style="background:#090d16; min-height:100vh; color:#e2e8f0; font-family:'Outfit', sans-serif;">
        <div style="display:flex; align-items:center; gap:10px; padding: 20px 40px; background: #0b0f19; border-bottom: 1px solid rgba(255,255,255,0.1); cursor:pointer;" onclick="window.navigate('dragon://search')">
          <span style="font-size:2rem;">🔮</span>
          <strong style="font-size:1.5rem; font-family:'Outfit', sans-serif;">DragonAI</strong>
        </div>
        
        <div style="max-width:800px; margin: 40px auto; text-align:center;" id="ai-container">
          <div class="glass-card" style="padding:40px; border-radius:15px; background:rgba(255,255,255,0.02); border:1px solid rgba(168,85,247,0.3); max-width:600px; margin:0 auto;">
            <div style="font-size:3rem; animation: spin 2s linear infinite; margin-bottom:20px; display:inline-block;">🌀</div>
            <h3 style="color:#c084fc; margin-top:0;">Synthesizing Unique Story Narrative...</h3>
            <p style="color:#94a3b8; font-size:0.9rem;">Initializing semantic vectors & mapping formal lexical structures...</p>
            <div style="width:100%; max-width:400px; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; margin:20px auto; overflow:hidden;">
              <div style="width:0%; height:100%; background:linear-gradient(90deg, #c084fc, #a855f7); border-radius:3px; animation: loadBar 0.8s forwards;"></div>
            </div>
          </div>
        </div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes loadBar { 0% { width: 0%; } 100% { width: 100%; } }
      </style>
    `;

    setTimeout(() => {
      const storyHTML = generateFormalStory(promptVal);
      const container = document.getElementById('ai-container');
      if (container) {
        container.innerHTML = storyHTML;
      }
    }, 850);
  } else {
    // Render Story Input UI
    contentDiv.innerHTML = `
      <div class="fake-site" style="background:#090d16; min-height:100vh; color:#e2e8f0; font-family:'Outfit', sans-serif;">
        <div style="display:flex; align-items:center; gap:10px; padding: 20px 40px; background: #0b0f19; border-bottom: 1px solid rgba(255,255,255,0.1); cursor:pointer;" onclick="window.navigate('dragon://search')">
          <span style="font-size:2rem;">🔮</span>
          <strong style="font-size:1.5rem; font-family:'Outfit', sans-serif;">DragonAI Story Writer</strong>
        </div>
        
        <div style="max-width:600px; margin: 40px auto;">
          <div class="glass-card" style="padding:35px; background:rgba(255,255,255,0.02); border:1px solid rgba(168,85,247,0.3); border-radius:15px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
            <h2 style="color:#c084fc; margin-top:0; font-size:1.8rem; text-shadow:0 0 10px rgba(168,85,247,0.2);">Narrative Generation Protocol</h2>
            <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:25px;">Enter any concept, characters, or actions below. The system will compile a formal, highly structured narrative document based on your prompt.</p>
            
            <form onsubmit="event.preventDefault(); window.navigate('dragon://ai?p=' + encodeURIComponent(document.getElementById('ai-prompt').value));">
              <label style="display:block; font-size:0.85rem; font-weight:bold; color:#cbd5e1; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Concept Prompt</label>
              <textarea id="ai-prompt" placeholder="e.g. A cybernetic dragon collecting gold coins in a space forest..." required style="width:100%; height:120px; padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:#05070c; color:#fff; font-size:1.05rem; line-height:1.5; resize:none; outline:none; margin-bottom:20px;" onfocus="this.style.borderColor='#c084fc'"></textarea>
              
              <div style="margin-bottom:25px;">
                <label style="display:block; font-size:0.85rem; font-weight:bold; color:#cbd5e1; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Tone Formulation</label>
                <div style="display:flex; justify-content:space-between; color:#94a3b8; font-size:0.8rem; margin-bottom:5px;">
                  <span>Understandable</span>
                  <span>Formal Analytical</span>
                </div>
                <input type="range" min="1" max="3" value="3" disabled style="width:100%; accent-color:#a855f7;">
              </div>
              
              <button type="submit" style="width:100%; background:linear-gradient(135deg, #c084fc, #a855f7); color:#fff; border:none; padding:15px; border-radius:25px; font-weight:bold; font-size:1.1rem; cursor:pointer; box-shadow: 0 4px 15px rgba(168,85,247,0.4); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">Compile Narrative</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}

function generateFormalStory(prompt) {
  const stopwords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'for', 'in', 'on', 'at', 'by', 'with', 'about', 'against', 'of', 'and', 'but', 'or', 'so', 'if', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'can', 'will', 'should', 'would', 'could', 'may', 'might', 'must', 'write', 'prompt', 'story', 'ai', 'feature', 'create', 'unique', 'about', 'like', 'how', 'what']);
  
  const words = prompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w && !stopwords.has(w));
  
  let k1 = words[0] || 'subject';
  let k2 = words[1] || 'secondary elements';
  let k3 = words[2] || 'environmental assets';
  let k4 = words[3] || 'operational vectors';

  // Capitalize for cleaner rendering
  k1 = k1.charAt(0).toUpperCase() + k1.slice(1);
  k2 = k2.charAt(0).toUpperCase() + k2.slice(1);
  k3 = k3.charAt(0).toUpperCase() + k3.slice(1);
  k4 = k4.charAt(0).toUpperCase() + k4.slice(1);

  const rand = getSeededRandom(prompt);

  const titles = [
    `The Chronicles of ${k1}: A Formal Inquiry into ${k2} and ${k3}`,
    `Case File: Detailed Observation of the ${k1} Phenomenon`,
    `A Formal Report on the Systemic Integration of ${k1} and ${k2}`
  ];

  const intros = [
    `In the compiled archives of virtual history, few subject files command as much formal investigation as the progression of **${k1}**. Originating from standard database sectors, this narrative marks a documented epoch. Key researchers have long noted the structural influence of **${k2}** in determining the behavioral parameters of the subject.`,
    `Under formal review by the sector directors, the chronicle of **${k1}** stands as a primary case study. Initial logs indicate that the integration of **${k2}** played a decisive role in shaping the environmental conditions surrounding the main subject. The following account details the formal sequence of operations.`,
    `System registers from the node terminal have recorded a unique series of events regarding **${k1}**. Academic researchers suggest that the co-existence of **${k2}** created a notable stabilization wave, which was subsequently analyzed to ensure baseline integrity.`
  ];

  const bodies = [
    `Historical logs record that during the core cycles, the subject (**${k1}**) initiated a series of systematic integrations. Observers noted that when **${k1}** intersected with **${k3}**, it produced an immediate, measurable stabilization. This event was not merely a random divergence; rather, it established a formal precedent for how **${k2}** interacts with primary portal frameworks under high-load conditions.`,
    `Detailed tactical logs show that the progression of **${k1}** was accelerated by external vectors linked to **${k3}**. Observers monitoring the grid noted that **${k2}** was successfully synthesized as a result of this action, confirming theoretical models proposed in previous cycles.`,
    `Operational archives verify that **${k1}** maintained structural alignment despite significant turbulence from **${k3}**. This resilient behavior is attributed directly to the systemic support of **${k2}**, which acted as a stabilizing agent during the peak integration phases. (Reference: ${k4} register logs).`
  ];

  const conclusions = [
    `In conclusion, the documented trajectory of **${k1}** offers critical insights into the integration of **${k2}** and **${k3}**. These findings have been formally logged into the system archives. Future operations within this sector are advised to refer to this record to maintain structural equilibrium.`,
    `Ultimately, the events surrounding **${k1}** serve as a standard reference point for similar portal configurations. The correlation between **${k2}** and **${k3}** is now a matter of public archive, establishing a clear protocol for upcoming exploration teams.`,
    `As a final note, the resolution of the **${k1}** incident confirms that **${k2}** and **${k3}** remain highly responsive to systematic inputs. The board has formally certified this log, concluding the investigative cycle for this period.`
  ];

  const pickedTitle = seededPick(titles, rand);
  const pickedIntro = seededPick(intros, rand);
  const pickedBody = seededPick(bodies, rand);
  const pickedConclusion = seededPick(conclusions, rand);

  return `
    <div class="glass-card" style="text-align:left; padding:35px; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.1); border-radius:12px; max-width:700px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="font-size:0.8rem; color:#a855f7; text-transform:uppercase; font-weight:bold; margin-bottom:10px; letter-spacing:1px;">DragonAI Generated Story Document</div>
      <h2 style="color:#fff; margin-top:0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px; font-family:'Times New Roman', serif; font-size:1.8rem;">${pickedTitle}</h2>
      
      <div style="line-height:1.7; font-size:1.05rem; color:#cbd5e1; font-family:'Times New Roman', serif;">
        <h4 style="color:#a855f7; margin-bottom:5px; text-transform:uppercase; font-size:0.85rem;">I. Preface & Historical Context</h4>
        <p style="margin-top:0; margin-bottom:20px; text-align:justify;">${pickedIntro}</p>

        <h4 style="color:#a855f7; margin-bottom:5px; text-transform:uppercase; font-size:0.85rem;">II. Narrative Breakdown</h4>
        <p style="margin-top:0; margin-bottom:20px; text-align:justify;">${pickedBody}</p>

        <h4 style="color:#a855f7; margin-bottom:5px; text-transform:uppercase; font-size:0.85rem;">III. Concluding Summary</h4>
        <p style="margin-top:0; margin-bottom:0; text-align:justify;">${pickedConclusion}</p>
      </div>
      
      <div style="margin-top:30px; display:flex; gap:10px;">
        <button onclick="window.navigate('dragon://ai')" style="background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:8px 15px; border-radius:20px; cursor:pointer;">Generate Another</button>
        <button onclick="window.navigate('dragon://search')" style="background:#a855f7; color:#fff; border:none; padding:8px 15px; border-radius:20px; cursor:pointer; font-weight:bold;">Search Engine</button>
      </div>
    </div>
  `;
}

// Init
navigate('dragon://search');
