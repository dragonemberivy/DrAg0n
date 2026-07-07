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

function renderPage(url) {
  // Parse URL
  let base = url;
  let query = '';
  if (url.includes('?')) {
    [base, query] = url.split('?');
  }

  if (base === 'dragon://search') {
    renderSearch(query);
  } else if (base.startsWith('dragon://tube')) {
    renderTube(base, query);
  } else if (base.startsWith('dragon://wiki')) {
    renderWiki(base);
  } else if (base.startsWith('dragon://news')) {
    renderNews(base);
  } else if (base === 'dragon://weather') {
    renderWeather();
  } else {
    contentDiv.innerHTML = `<div class="fake-site"><h1 style="color:red; text-align:center;">404 - Dragon Not Found</h1></div>`;
  }
}

// --- SEARCH ENGINE ---
function renderSearch(query) {
  let searchVal = query ? decodeURIComponent(query.replace('q=', '').replace(/\+/g, ' ')).toLowerCase() : '';
  
  let resultsHTML = '';
  if (searchVal) {
    let matches = [];

    if (searchVal.includes('coin') || searchVal.includes('dc') || searchVal.includes('money')) {
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://wiki/Dragon_Coins')" class="ds-link">DragonWiki: Dragon Coins</a>
          <div class="ds-desc">Learn all about the history and economy of Dragon Coins (DC), the primary currency...</div>
        </div>
      `);
    }
    
    if (searchVal.includes('game') || searchVal.includes('play') || searchVal.includes('flappy')) {
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://tube/watch?v=1')" class="ds-link">DragonTube - 10 Hours of Flappy Dragon Gameplay</a>
          <div class="ds-desc">Watch the ultimate pro player score over 9000 in Flappy Dragon...</div>
        </div>
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://wiki/Flappy_Dragon')" class="ds-link">DragonWiki: Flappy Dragon</a>
          <div class="ds-desc">An in-depth article detailing the history, mechanics, and strategies of the popular arcade game...</div>
        </div>
      `);
    }

    if (searchVal.includes('news') || searchVal.includes('daily') || searchVal.includes('article')) {
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://news/article-1')" class="ds-link">The Daily Dragon: "I got rich playing Flappy Dragon!"</a>
          <div class="ds-desc">One local dragon reveals their secret to unlimited wealth using this one weird trick...</div>
        </div>
      `);
    }
    
    if (searchVal.includes('weather') || searchVal.includes('forecast') || searchVal.includes('temp')) {
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://weather')" class="ds-link">Local Weather Forecast</a>
          <div class="ds-desc">Is it safe to fly today? Check the latest atmospheric conditions...</div>
        </div>
      `);
    }

    if (searchVal.includes('planet') || searchVal.includes('space') || searchVal.includes('generator')) {
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://tube/watch?v=3')" class="ds-link">DragonTube - Reacting to YOUR Planets!</a>
          <div class="ds-desc">A deep dive into procedurally generated worlds and the science behind name hashing...</div>
        </div>
      `);
    }

    // Default results if no matches
    if (matches.length === 0) {
      matches.push(`
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://wiki/Main_Page')" class="ds-link">DragonWiki: Main Page</a>
          <div class="ds-desc">Explore the encyclopedia of the DrAg0n ecosystem. Find articles on everything from games to pets...</div>
        </div>
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://tube')" class="ds-link">DragonTube: Home</a>
          <div class="ds-desc">Watch trending videos, tutorials, and music streams shared inside the community...</div>
        </div>
      `);
    }

    resultsHTML = `
      <div class="ds-results">
        <div style="color:#70757a; margin-bottom: 20px;">About 3,141,592 results (0.42 seconds) for <b>${searchVal}</b></div>
        ${matches.join('')}
      </div>
    `;
  }

  contentDiv.innerHTML = `
    <div class="fake-site">
      <div class="ds-logo">
        <span style="color:#4285F4">D</span><span style="color:#EA4335">r</span><span style="color:#FBBC05">a</span><span style="color:#4285F4">g</span><span style="color:#34A853">o</span><span style="color:#EA4335">n</span><span style="color:#70757a; font-size: 2rem;">Search</span>
      </div>
      <form onsubmit="event.preventDefault(); window.navigate('dragon://search?q=' + encodeURIComponent(document.getElementById('ds-in').value));">
        <input type="text" class="ds-input" id="ds-in" value="${searchVal || ''}" placeholder="Search the tiny web...">
        <button class="ds-btn" type="submit">Dragon Search</button>
      </form>
      ${resultsHTML}
    </div>
  `;
}

// --- DRAGON TUBE ---
function renderTube(base, query) {
  if (query.includes('v=')) {
    const videoIdMap = {
      '1': 'jfKfPfyJRdk', // Lofi Girl Radio
      '2': 'dQw4w9WgXcQ', // Rickroll
      '3': 'i93Z7zljQ7I', // Scale of Universe zoom
      '4': 'W32qC7U1Y_4'  // Funny compilation
    };
    const titleMap = {
      '1': '10 Hours of Flappy Dragon Gameplay',
      '2': 'How to get infinite DC! (Not clickbait)',
      '3': 'Reacting to YOUR Planets!',
      '4': 'Global Jukebox Fail Compilation'
    };
    const descMap = {
      '1': 'Relax and study to this endless lo-fi stream featuring cute dragon animations and cozy space backgrounds.',
      '2': 'A tutorial detailing how to maximize your coin collection. Watch until the end for the ultimate trick!',
      '3': 'Analyzing the incredible procedural rendering algorithms of the planet generator. Space is truly infinite!',
      '4': 'A collection of the funniest moments and failures on the Global Jukebox. Turn up the volume!'
    };
    
    const v = query.split('=')[1];
    const ytid = videoIdMap[v] || 'jfKfPfyJRdk';
    const title = titleMap[v] || 'Epic Video';
    const desc = descMap[v] || 'This is a super cool video playing on the Tiny Internet. Like and subscribe!';
    
    // Watch video with a real YouTube iframe embed
    contentDiv.innerHTML = `
      <div class="dt-player-container">
        <div class="dt-header" style="margin-bottom: 20px; cursor:pointer;" onclick="window.navigate('dragon://tube')">
          <span style="color:red;">▶</span> DragonTube
        </div>
        <div style="position: relative; width: 100%; max-width: 800px; padding-bottom: 56.25%; height: 0; margin: 0 auto 20px auto; background: black; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <iframe src="https://www.youtube.com/embed/${ytid}?autoplay=1" 
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                  allow="autoplay; encrypted-media" allowfullscreen>
          </iframe>
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
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=1')">
          <div class="dt-thumb" style="background: linear-gradient(135deg, #1e1b4b, #311042);">🎧</div>
          <div class="dt-title">10 Hours of Flappy Dragon</div>
          <div class="dt-channel">ProGamer</div>
        </div>
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=2')">
          <div class="dt-thumb" style="background: linear-gradient(135deg, #450a0a, #780202);">💰</div>
          <div class="dt-title">How to get infinite DC! (Not clickbait)</div>
          <div class="dt-channel">EconomyHax</div>
        </div>
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=3')">
          <div class="dt-thumb" style="background: linear-gradient(135deg, #022c22, #065f46);">🪐</div>
          <div class="dt-title">Reacting to YOUR Planets!</div>
          <div class="dt-channel">SpaceExplorer</div>
        </div>
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=4')">
          <div class="dt-thumb" style="background: linear-gradient(135deg, #172554, #1e3a8a);">🎵</div>
          <div class="dt-title">Global Jukebox Fail Compilation</div>
          <div class="dt-channel">FunnyClips</div>
        </div>
      </div>
    `;
  }
}

// --- DRAGON WIKI ---
function renderWiki(base) {
  const article = base.split('/').pop() || 'Main_Page';
  const title = article.replace(/_/g, ' ');

  let contentHTML = '';
  
  if (article === 'Dragon_Coins') {
    contentHTML = `
      <h1 class="dw-header">Dragon Coins (DC)</h1>
      <div class="dw-infobox">
        <div style="background:#ddd; text-align:center; padding:5px; font-weight:bold;">Dragon Coins</div>
        <div style="padding:10px; text-align:center;">
          <div style="font-size:4rem; margin-bottom:10px;">🪙</div>
          <i>The official currency of DrAg0n.</i>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
          <tr style="border-top:1px solid #ccc;"><td style="font-weight:bold; padding:4px;">Type</td><td style="padding:4px;">Virtual Currency</td></tr>
          <tr style="border-top:1px solid #ccc;"><td style="font-weight:bold; padding:4px;">Earn Rate</td><td style="padding:4px;">High (Arcade)</td></tr>
          <tr style="border-top:1px solid #ccc;"><td style="font-weight:bold; padding:4px;">Symbol</td><td style="padding:4px;">DC</td></tr>
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
        <div style="background:#ddd; text-align:center; padding:5px; font-weight:bold;">Flappy Dragon</div>
        <div style="padding:10px; text-align:center;">
          <div style="font-size:4rem; margin-bottom:10px;">🐉</div>
          <i>The classic side-scrolling game.</i>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
          <tr style="border-top:1px solid #ccc;"><td style="font-weight:bold; padding:4px;">Developer</td><td style="padding:4px;">DrAg0n Team</td></tr>
          <tr style="border-top:1px solid #ccc;"><td style="font-weight:bold; padding:4px;">Genre</td><td style="padding:4px;">Arcade / Avoidance</td></tr>
          <tr style="border-top:1px solid #ccc;"><td style="font-weight:bold; padding:4px;">Platform</td><td style="padding:4px;">HTML5 Canvas</td></tr>
        </table>
      </div>
      <p><b>Flappy Dragon</b> is a popular HTML5 arcade game integrated directly into the DrAg0n Arcade. Players control a flying dragon, attempting to navigate through gaps in green pipes without hitting the floor or the obstacles.</p>
      <h2>Gameplay</h2>
      <p>The game is played by clicking or tapping the game screen to trigger a vertical jump ("flap"). Gravity pulls the dragon down constantly. Success requires careful timing and spatial judgment.</p>
      <h2>Rewards</h2>
      <p>Players earn 5 XP and 10 DC instantly for every obstacle successfully passed, making it the most popular speed-farming method for currency on the platform.</p>
    `;
  } else if (article === 'Main_Page' || !article) {
    contentHTML = `
      <h1 class="dw-header">Welcome to DragonWiki!</h1>
      <p>Welcome to <b>DragonWiki</b>, the community-driven encyclopedia documenting the history, mechanics, currency, and architecture of the DrAg0n website!</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px;">
        <div style="background:#f8f9fa; padding:15px; border:1px solid #c8ccd1; border-radius:8px;">
          <h3>🪙 Economy</h3>
          <p>Read about the currency <a href="#" onclick="window.navigate('dragon://wiki/Dragon_Coins')">Dragon Coins</a> and what items you can buy at the shop.</p>
        </div>
        <div style="background:#f8f9fa; padding:15px; border:1px solid #c8ccd1; border-radius:8px;">
          <h3>🎮 Arcade</h3>
          <p>Explore games like <a href="#" onclick="window.navigate('dragon://wiki/Flappy_Dragon')">Flappy Dragon</a> and how they pay out rewards.</p>
        </div>
      </div>
    `;
  } else {
    // Dynamic default page
    contentHTML = `
      <h1 class="dw-header">${title}</h1>
      <div class="dw-infobox">
        <div style="background:#ddd; text-align:center; padding:5px; font-weight:bold;">${title}</div>
        <div style="padding:10px; text-align:center;">
          <div style="font-size:4rem; margin-bottom:10px;">🌐</div>
          <i>No custom graphic uploaded.</i>
        </div>
      </div>
      <p><b>${title}</b> is a topic currently indexed on the Tiny Internet. It was discovered in 2026 by users exploring the local search database.</p>
      <p>More detailed community research is required to expand this article. Check back later for updates!</p>
    `;
  }

  contentDiv.innerHTML = `
    <div class="fake-site" style="background:#f6f6f6; min-height: 100vh;">
      <div style="display:flex; align-items:center; gap:10px; padding: 20px 40px; background: white; border-bottom: 1px solid #c8ccd1; cursor:pointer;" onclick="window.navigate('dragon://wiki/Main_Page')">
        <span style="font-size:2rem;">🌐</span>
        <strong style="font-size:1.5rem; font-family:serif;">DragonWiki</strong>
      </div>
      
      <div class="dw-content" style="margin-top:20px;">
        ${contentHTML}
      </div>
    </div>
  `;
}

// --- DRAGON NEWS ---
function renderNews(base) {
  const article = base.split('/').pop();
  
  if (article && article.startsWith('article')) {
    contentDiv.innerHTML = `
      <div class="fake-site">
        <div class="dn-header" style="cursor:pointer;" onclick="window.navigate('dragon://news')">
          <h1 class="dn-title">The Daily Dragon</h1>
          <div class="dn-date">Providing truth to the digital realm since yesterday.</div>
        </div>
        <h1 class="dn-headline">SHOCKING DISCOVERY: LOCAL DRAGON BECOMES BILLIONAIRE</h1>
        <div class="dn-article">
          <p>Reports are flooding in that a local user has amassed over 1,000,000 DC just by playing Flappy Dragon repeatedly for 72 hours straight.</p>
          <p>"It was easy," the user stated, sipping on a virtual smoothie. "I just kept clicking."</p>
          <p>Economists are worried this massive influx of DC might inflate the shop prices, making the Golden Crown unaffordable for average citizens.</p>
          <p>However, the shopkeeper assures everyone that prices will remain stable. <a href="#" onclick="window.navigate('dragon://wiki/Dragon_Coins')">Read more about the economy here.</a></p>
        </div>
      </div>
    `;
  } else {
    contentDiv.innerHTML = `
      <div class="fake-site">
        <div class="dn-header">
          <h1 class="dn-title">The Daily Dragon</h1>
          <div class="dn-date">Providing truth to the digital realm since yesterday.</div>
        </div>
        
        <div style="max-width:800px; margin: 0 auto; display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
          <div>
            <img src="https://images.unsplash.com/photo-1517594422361-5e18d4182470?auto=format&fit=crop&q=80&w=800" style="width:100%; filter:grayscale(100%); margin-bottom:10px;">
            <h2 style="font-family:serif; font-size:2rem;"><a href="#" onclick="window.navigate('dragon://news/article-1')" style="color:black; text-decoration:none;">LOCAL DRAGON BECOMES BILLIONAIRE</a></h2>
            <p style="font-family:serif;">Economy shaken as user exploits Flappy Dragon mechanics to gain immense wealth...</p>
          </div>
          <div>
            <div style="border-bottom:1px solid #ccc; padding-bottom:10px; margin-bottom:10px;">
              <h3 style="font-family:serif; margin:0;"><a href="#" onclick="window.navigate('dragon://weather')" style="color:black; text-decoration:none;">Weather Forecast</a></h3>
              <p style="font-family:serif; margin:5px 0;">Warning: Meteor Showers expected.</p>
            </div>
            <div style="border-bottom:1px solid #ccc; padding-bottom:10px; margin-bottom:10px;">
              <h3 style="font-family:serif; margin:0;">Sports</h3>
              <p style="font-family:serif; margin:5px 0;">Cave Clan defeats Forest Clan in Tic-Tac-Toe championship!</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// --- DRAGON WEATHER ---
function renderWeather() {
  contentDiv.innerHTML = `
    <div class="fake-site dwx-bg">
      <div style="font-size: 5rem;">☄️</div>
      <h1 style="font-size: 3rem; margin:0;">Dragon City</h1>
      <div class="dwx-temp">400°C</div>
      <div class="dwx-desc">Heavy Meteor Showers</div>
      <p style="font-size: 1.2rem; margin-top:20px; opacity:0.8;">
        Wind: 200 km/h | Humidity: 0% | Visibility: Poor
      </p>
      <div style="margin-top: 50px; display:flex; justify-content:center; gap:20px;">
        <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:10px; width:100px;">
          <div>Tomorrow</div>
          <div style="font-size:2rem; margin:10px 0;">🌋</div>
          <div>420°C</div>
        </div>
        <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:10px; width:100px;">
          <div>Friday</div>
          <div style="font-size:2rem; margin:10px 0;">🔥</div>
          <div>390°C</div>
        </div>
      </div>
    </div>
  `;
}

// Init
navigate('dragon://search');
