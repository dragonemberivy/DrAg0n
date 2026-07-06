import re
import os

# 1. Update CSS for Light Mode & XP Bar
with open("assets/css/styles.css", "r") as f:
    css = f.read()

light_theme = """
    body.light-theme {
      --bg-color: #f8fafc;
      --surface: #ffffff;
      --surface-hover: #f1f5f9;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: rgba(0,0,0,0.15);
      --glass-bg: rgba(255, 255, 255, 0.7);
    }
    body.light-theme h1, body.light-theme h2, body.light-theme h3 { color: #0f172a; }
    body.light-theme .nav-card { background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.2)); color: #0f172a; }
    
    .xp-bar-container {
      width: 100%;
      height: 6px;
      background: rgba(0,0,0,0.3);
      border-radius: 10px;
      margin-top: 5px;
      overflow: hidden;
    }
    body.light-theme .xp-bar-container { background: rgba(0,0,0,0.1); }
    .xp-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #c084fc);
      width: 0%;
      transition: width 0.3s;
    }
"""
if "body.light-theme" not in css:
    css += light_theme
    with open("assets/css/styles.css", "w") as f:
        f.write(css)


# 2. Inject Lofi Player & Theme Toggle HTML into all pages
lofi_html = """
  <!-- THEME TOGGLE -->
  <div id="theme-toggle" style="position: fixed; top: 2rem; right: 200px; font-size: 1.5rem; cursor: pointer; z-index: 100000; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 50%; border: 1px solid var(--border); width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;">🌙</div>

  <!-- LOFI PLAYER -->
  <div id="lofi-player" class="glass-card" style="position:fixed; bottom:20px; right:20px; padding:10px 15px; display:flex; align-items:center; gap:10px; z-index:99999; border-radius: 30px;">
    <span style="font-size:1.2rem;">🎧</span>
    <audio id="lofi-audio" loop>
      <source src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" type="audio/mpeg">
    </audio>
    <button id="lofi-play" style="padding:5px 12px; font-size:0.8rem; border-radius: 20px;">Play</button>
  </div>
"""

pages = ["index.html", "games.html", "space-game.html", "chat.html", "club.html"]
for page in pages:
    if os.path.exists(page):
        with open(page, "r") as f:
            content = f.read()
        if 'id="theme-toggle"' not in content:
            content = re.sub(r'(<body[^>]*>)', r'\1\n' + lofi_html, content)
            with open(page, "w") as f:
                f.write(content)


# 3. Update main.js with Leveling, Lofi, Theme, and Chat Notifications
with open("assets/js/main.js", "r") as f:
    main_js = f.read()

# Modify Profile Widget to include Level and XP bar
old_profile_widget = """
      if(u) {
        pwName.textContent = u;
        pwAvatar.innerHTML = a.startsWith('data:') ? `<img src="${a}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;">` : a;
      }
"""
new_profile_widget = """
      if(u) {
        let xp = parseInt(localStorage.getItem('drag0n_xp') || '0');
        let level = Math.floor(Math.sqrt(xp / 100)) + 1;
        let nextLvlXp = Math.pow(level, 2) * 100;
        let prevLvlXp = Math.pow(level - 1, 2) * 100;
        let progress = ((xp - prevLvlXp) / (nextLvlXp - prevLvlXp)) * 100;

        pwName.innerHTML = `<div style="line-height:1.2;">${u} <span style="font-size:0.7rem; color:var(--accent-secondary);">Lv.${level}</span></div>
                            <div class="xp-bar-container"><div class="xp-bar-fill" style="width:${progress}%"></div></div>`;
        pwAvatar.innerHTML = a.startsWith('data:') ? `<img src="${a}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;">` : a;
      }
"""
if "let xp =" not in main_js:
    main_js = main_js.replace(old_profile_widget, new_profile_widget)

# Add Global XP function
xp_func = """
    window.addXP = function(amount) {
      if(localStorage.getItem('drag0n_owner') === 'true') return; // owner doesn't level
      if(!localStorage.getItem('drag0n_user')) return; // unregistered doesn't level
      let currentXp = parseInt(localStorage.getItem('drag0n_xp') || '0');
      let oldLvl = Math.floor(Math.sqrt(currentXp / 100)) + 1;
      
      currentXp += amount;
      localStorage.setItem('drag0n_xp', currentXp);
      
      let newLvl = Math.floor(Math.sqrt(currentXp / 100)) + 1;
      if(newLvl > oldLvl) {
        const pop = document.getElementById('pop-sound');
        if(pop) pop.play().catch(()=>{});
      }
      updateProfileWidget();
      
      // Sync to firebase
      if(typeof firebase !== 'undefined') {
        firebase.database().ref('users/' + localStorage.getItem('drag0n_user').toLowerCase() + '/xp').set(currentXp);
      }
    };
    
    // Give daily login XP (50)
    window.addEventListener('load', () => {
      const today = new Date().toISOString().split('T')[0];
      if(localStorage.getItem('drag0n_last_login') !== today) {
        localStorage.setItem('drag0n_last_login', today);
        setTimeout(() => window.addXP(50), 2000);
      }
    });
"""

if "window.addXP =" not in main_js:
    main_js += xp_func

# Add Theme & Lofi Logic & Chat Notif
misc_logic = """
    // THEME TOGGLE
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) {
      if(localStorage.getItem('drag0n_theme') === 'light') {
        document.body.classList.add('light-theme');
        themeBtn.textContent = '☀️';
      }
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if(document.body.classList.contains('light-theme')) {
          localStorage.setItem('drag0n_theme', 'light');
          themeBtn.textContent = '☀️';
        } else {
          localStorage.setItem('drag0n_theme', 'dark');
          themeBtn.textContent = '🌙';
        }
      });
    }

    // LOFI PLAYER
    const lofiAudio = document.getElementById('lofi-audio');
    const lofiBtn = document.getElementById('lofi-play');
    if(lofiBtn && lofiAudio) {
      // Remember state
      if(sessionStorage.getItem('lofi_playing') === 'true') {
        lofiAudio.play().catch(()=>{});
        lofiBtn.textContent = 'Pause';
      }
      lofiBtn.addEventListener('click', () => {
        if(lofiAudio.paused) {
          lofiAudio.play();
          lofiBtn.textContent = 'Pause';
          sessionStorage.setItem('lofi_playing', 'true');
        } else {
          lofiAudio.pause();
          lofiBtn.textContent = 'Play';
          sessionStorage.setItem('lofi_playing', 'false');
        }
      });
    }

    // CHAT NOTIFICATIONS (On Index)
    if(window.location.pathname.endsWith('index.html') && typeof firebase !== 'undefined') {
      setTimeout(() => {
        try {
          const chatCard = document.querySelector('a[href="chat.html"]');
          if(chatCard) {
            let initialLoad = true;
            firebase.database().ref('chatrooms/Forest/messages').limitToLast(1).on('child_added', (snap) => {
              if(initialLoad) { initialLoad = false; return; }
              // Add badge
              if(!chatCard.querySelector('.chat-badge')) {
                chatCard.style.position = 'relative';
                const badge = document.createElement('div');
                badge.className = 'chat-badge';
                badge.style.cssText = 'position:absolute; top:15px; right:15px; width:15px; height:15px; background:#ef4444; border-radius:50%; box-shadow:0 0 10px #ef4444; animation:pulseGlow 1s infinite;';
                chatCard.appendChild(badge);
              }
            });
          }
        } catch(e){}
      }, 3000); // wait for auth
    }
"""
if "// THEME TOGGLE" not in main_js:
    main_js += misc_logic

# Add XP to chat messages
main_js = main_js.replace(
    "chatInp.value = '';",
    "chatInp.value = '';\n        if(window.addXP) window.addXP(10); // 10 XP per message"
)

with open("assets/js/main.js", "w") as f:
    f.write(main_js)

