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
  let searchVal = query ? decodeURIComponent(query.replace('q=', '').replace(/\+/g, ' ')) : '';
  
  let resultsHTML = '';
  if (searchVal) {
    resultsHTML = `
      <div class="ds-results">
        <div style="color:#70757a; margin-bottom: 20px;">About 3,141,592 results (0.42 seconds) for <b>${searchVal}</b></div>
        
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://wiki/Dragon_Coins')" class="ds-link">DragonWiki: Dragon Coins</a>
          <div class="ds-desc">Learn all about the history and economy of Dragon Coins (DC), the primary currency...</div>
        </div>
        
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://tube/watch?v=1')" class="ds-link">DragonTube - 10 Hours of Flappy Dragon Gameplay</a>
          <div class="ds-desc">Watch the ultimate pro player score over 9000 in Flappy Dragon...</div>
        </div>

        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://news/article-1')" class="ds-link">The Daily Dragon: "I got rich playing Flappy Dragon!"</a>
          <div class="ds-desc">One local dragon reveals their secret to unlimited wealth using this one weird trick...</div>
        </div>
        
        <div class="ds-result">
          <a href="#" onclick="window.navigate('dragon://weather')" class="ds-link">Local Weather Forecast</a>
          <div class="ds-desc">Is it safe to fly today? Check the latest atmospheric conditions...</div>
        </div>
      </div>
    `;
  }

  contentDiv.innerHTML = `
    <div class="fake-site">
      <div class="ds-logo">
        <span style="color:#4285F4">D</span><span style="color:#EA4335">r</span><span style="color:#FBBC05">a</span><span style="color:#4285F4">g</span><span style="color:#34A853">o</span><span style="color:#EA4335">n</span><span style="color:#70757a; font-size: 2rem;">Search</span>
      </div>
      <form onsubmit="event.preventDefault(); window.navigate('dragon://search?q=' + encodeURIComponent(document.getElementById('ds-in').value));">
        <input type="text" class="ds-input" id="ds-in" value="${searchVal}" placeholder="Search the tiny web...">
        <button class="ds-btn" type="submit">Dragon Search</button>
      </form>
      ${resultsHTML}
    </div>
  `;
}

// --- DRAGON TUBE ---
function renderTube(base, query) {
  if (query.includes('v=')) {
    // Watch video
    contentDiv.innerHTML = `
      <div class="dt-player-container">
        <div class="dt-header" style="margin-bottom: 20px; cursor:pointer;" onclick="window.navigate('dragon://tube')">
          <span style="color:red;">▶</span> DragonTube
        </div>
        <div class="dt-player">
          [ V I D E O &nbsp; P L A Y I N G ]
        </div>
        <h1 style="font-size: 1.5rem;">Epic Video Title #${query.split('=')[1]}</h1>
        <p style="color:#aaa;">1.2M views • 2 days ago</p>
        <hr style="border-color:#333; margin:20px 0;">
        <p>This is a super cool video about dragons doing dragon things. Like and subscribe!</p>
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
          <div class="dt-thumb">🐉</div>
          <div class="dt-title">10 Hours of Flappy Dragon</div>
          <div class="dt-channel">ProGamer</div>
        </div>
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=2')">
          <div class="dt-thumb">💰</div>
          <div class="dt-title">How to get infinite DC! (Not clickbait)</div>
          <div class="dt-channel">EconomyHax</div>
        </div>
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=3')">
          <div class="dt-thumb">🪐</div>
          <div class="dt-title">Reacting to YOUR Planets!</div>
          <div class="dt-channel">SpaceExplorer</div>
        </div>
        <div class="dt-card" onclick="window.navigate('dragon://tube/watch?v=4')">
          <div class="dt-thumb">🎵</div>
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

  contentDiv.innerHTML = `
    <div class="fake-site" style="background:#f6f6f6; min-height: 100vh;">
      <div style="display:flex; align-items:center; gap:10px; padding: 20px 40px; background: white; border-bottom: 1px solid #c8ccd1; cursor:pointer;" onclick="window.navigate('dragon://wiki')">
        <span style="font-size:2rem;">🌐</span>
        <strong style="font-size:1.5rem; font-family:serif;">DragonWiki</strong>
      </div>
      
      <div class="dw-content" style="margin-top:20px;">
        <h1 class="dw-header">${title}</h1>
        <div class="dw-infobox">
          <div style="background:#ddd; text-align:center; padding:5px; font-weight:bold;">${title}</div>
          <div style="padding:10px; text-align:center;">
            <div style="font-size:4rem; margin-bottom:10px;">${article.includes('Coin') ? '🪙' : '🐉'}</div>
            <i>A depiction of ${title}.</i>
          </div>
        </div>
        <p><b>${title}</b> is a phenomenon widely discussed on the Tiny Internet. It was first discovered in 2026 by a mysterious developer.</p>
        <p>Many scholars argue that ${title} is crucial to the DrAg0n ecosystem, providing entertainment and/or currency to visitors.</p>
        <h2>History</h2>
        <p>In the early days, before the <b>Tiny Internet</b> existed, users had to navigate the main site manually. The introduction of ${title} revolutionized the way people interacted with the platform.</p>
        <h2>See Also</h2>
        <ul>
          <li><a href="#" onclick="window.navigate('dragon://search?q=${title}')">Search for ${title}</a></li>
          <li><a href="#" onclick="window.navigate('dragon://news')">Latest News</a></li>
        </ul>
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
