import re
import os

# 1. Book Club Upvotes in main.js
with open("assets/js/main.js", "r") as f:
    main_js = f.read()

render_logic_old = """
    div.innerHTML = `<span style="margin-right: 5px; font-size: 1.2rem;">${avatar.startsWith('data:') ? '<img src="'+avatar+'" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;">' : avatar}</span><strong style="color: #38bdf8;">${escapedUsername}:</strong> ${escapedText}`;
    target.appendChild(div);
"""
render_logic_new = """
    const upvotes = reviewData.upvotes || 0;
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="margin-right: 5px; font-size: 1.2rem;">${avatar.startsWith('data:') ? '<img src="'+avatar+'" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;">' : avatar}</span>
          <strong style="color: #38bdf8;">${escapedUsername}:</strong> ${escapedText}
        </div>
        <div style="cursor:pointer; background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:12px; font-size:0.9rem;" onclick="window.upvoteReview('${bookId}', '${reviewKey}')">
          👍 <span id="upvotes-${reviewKey}">${upvotes}</span>
        </div>
      </div>
    `;
    target.appendChild(div);
"""
if "window.upvoteReview" not in main_js:
    main_js = main_js.replace(render_logic_old, render_logic_new)
    
    upvote_func = """
    window.upvoteReview = function(bookId, reviewKey) {
      if(!localStorage.getItem('drag0n_user')) { alert('Create a profile to upvote!'); return; }
      if(localStorage.getItem('upvoted_'+reviewKey)) { alert('You already upvoted this!'); return; }
      
      localStorage.setItem('upvoted_'+reviewKey, 'true');
      const ref = firebase.database().ref('book_reviews/' + bookId + '/' + reviewKey + '/upvotes');
      ref.transaction(current => (current || 0) + 1);
      if(window.addXP) window.addXP(5); // 5 XP for upvoting!
    };
"""
    main_js += upvote_func

# 2. Dynamic Backgrounds in Profile Widget
bg_logic = """
    // DYNAMIC BACKGROUNDS
    const bgColors = {
      'Space': 'var(--bg-color)',
      'Matrix': '#002200',
      'Ocean': '#001a33',
      'Sunset': '#331a00'
    };
    window.changeBackground = function(themeName) {
      localStorage.setItem('drag0n_bg', themeName);
      applyBackground();
    };
    function applyBackground() {
      const bg = localStorage.getItem('drag0n_bg');
      if(bg && bgColors[bg]) {
        document.body.style.backgroundColor = bgColors[bg];
        if(bg === 'Matrix') document.body.style.backgroundImage = 'radial-gradient(circle, #004400 0%, #001100 100%)';
        else if(bg === 'Ocean') document.body.style.backgroundImage = 'linear-gradient(to bottom, #001a33, #004d99)';
        else if(bg === 'Sunset') document.body.style.backgroundImage = 'linear-gradient(to bottom, #331a00, #993300)';
        else document.body.style.backgroundImage = 'none';
      }
    }
    window.addEventListener('load', applyBackground);
"""
if "// DYNAMIC BACKGROUNDS" not in main_js:
    main_js += bg_logic

    # Add dropdown to profile widget
    old_pw = "pwName.innerHTML = `<div style=\"line-height:1.2;\">${u} <span style=\"font-size:0.7rem; color:var(--accent-secondary);\">Lv.${level}</span></div>"
    new_pw = """
        pwName.innerHTML = `<div style="line-height:1.2;">${u} <span style="font-size:0.7rem; color:var(--accent-secondary);">Lv.${level}</span></div>
                            <select onchange="window.changeBackground(this.value)" style="margin-top:2px; font-size:0.7rem; background:transparent; color:var(--text-muted); border:1px solid var(--border); border-radius:4px;" onclick="event.stopPropagation()">
                              <option value="Space">Space</option>
                              <option value="Matrix">Matrix</option>
                              <option value="Ocean">Ocean</option>
                              <option value="Sunset">Sunset</option>
                            </select>
"""
    main_js = main_js.replace(old_pw, new_pw)


# 3. Golden Dragon Easter Egg Hunt
egg_logic = """
    // EASTER EGG HUNT
    window.findEgg = function(eggId, element) {
      element.style.display = 'none';
      let found = JSON.parse(localStorage.getItem('drag0n_eggs') || '[]');
      if(!found.includes(eggId)) {
        found.push(eggId);
        localStorage.setItem('drag0n_eggs', JSON.stringify(found));
        alert(`You found a secret token! (${found.length}/5)`);
        if(window.addXP) window.addXP(100);
        
        if(found.length === 5) {
          alert('YOU FOUND ALL 5 TOKENS! YOU UNLOCKED THE GOLDEN DRAGON AVATAR!');
          localStorage.setItem('drag0n_avatar', '🐲');
          if(typeof firebase !== 'undefined' && localStorage.getItem('drag0n_user')) {
             firebase.database().ref('users/' + localStorage.getItem('drag0n_user').toLowerCase() + '/avatar').set('🐲');
          }
          updateProfileWidget();
        }
      }
    };
"""
if "// EASTER EGG HUNT" not in main_js:
    main_js += egg_logic

with open("assets/js/main.js", "w") as f:
    f.write(main_js)

# 4. Inject Tokens into HTML pages
pages_eggs = {
    "index.html": '<div onclick="window.findEgg(\'egg1\', this)" style="position:absolute; bottom:50px; left:10px; font-size:0.5rem; cursor:pointer; z-index:10; opacity:0.1;">🪙</div>',
    "games.html": '<div onclick="window.findEgg(\'egg2\', this)" style="position:absolute; top:300px; right:10px; font-size:0.5rem; cursor:pointer; z-index:10; opacity:0.1;">🪙</div>',
    "space-game.html": '<div onclick="window.findEgg(\'egg3\', this)" style="position:absolute; top:50px; left:50px; font-size:0.5rem; cursor:pointer; z-index:10; opacity:0.1;">🪙</div>',
    "chat.html": '<div onclick="window.findEgg(\'egg4\', this)" style="position:absolute; bottom:150px; right:50px; font-size:0.5rem; cursor:pointer; z-index:10; opacity:0.1;">🪙</div>',
    "club.html": '<div onclick="window.findEgg(\'egg5\', this)" style="position:absolute; top:200px; left:100px; font-size:0.5rem; cursor:pointer; z-index:10; opacity:0.1;">🪙</div>'
}

for page, egg in pages_eggs.items():
    if os.path.exists(page):
        with open(page, "r") as f:
            content = f.read()
        if "window.findEgg" not in content:
            content = re.sub(r'(<body[^>]*>)', r'\1\n  ' + egg, content)
            with open(page, "w") as f:
                f.write(content)

