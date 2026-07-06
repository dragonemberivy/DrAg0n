import re
import os

with open("assets/js/main.js", "r") as f:
    main_js = f.read()

# 1. Update addXP to also add DC
xp_logic_old = """
      currentXp += amount;
      localStorage.setItem('drag0n_xp', currentXp);
"""
xp_logic_new = """
      currentXp += amount;
      localStorage.setItem('drag0n_xp', currentXp);
      
      let dcEarned = Math.floor(amount / 5);
      if(dcEarned > 0) {
        let currentDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        currentDC += dcEarned;
        localStorage.setItem('drag0n_dc', currentDC);
      }
      
      // Check Achievements
      if(window.checkAchievements) window.checkAchievements();
"""
if "let dcEarned =" not in main_js:
    main_js = main_js.replace(xp_logic_old, xp_logic_new)

# 2. Add Achievements & Purchases to Profile Widget
pw_logic_old = """pwName.innerHTML = `<div style="line-height:1.2;">${u} <span style="font-size:0.7rem; color:var(--accent-secondary);">Lv.${level}</span></div>"""
pw_logic_new = """
        let purchases = JSON.parse(localStorage.getItem('drag0n_purchases') || '{}');
        let achievements = JSON.parse(localStorage.getItem('drag0n_achievements') || '[]');
        let nameColor = purchases.chatColor === 'gold' ? '#fbbf24' : 'inherit';
        let vipBadge = purchases.badge === 'vip' ? '👑' : '';
        let borderStyle = purchases.avatarBorder === 'fire' ? 'border: 2px solid #ef4444; box-shadow: 0 0 10px #ef4444;' : '';
        let aHtml = a.startsWith('data:') ? `<img src="${a}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle; ${borderStyle}">` : `<span style="${borderStyle} border-radius:50%; padding:2px;">${a}</span>`;
        
        let achHtml = achievements.map(ach => `<span title="${ach}" style="font-size:0.8rem; margin-right:2px;">🏅</span>`).join('');
        
        pwName.innerHTML = `<div style="line-height:1.2; color:${nameColor};">${vipBadge}${u} <span style="font-size:0.7rem; color:var(--accent-secondary);">Lv.${level}</span> <div style="margin-top:2px;">${achHtml}</div></div>"""
if "let purchases =" not in main_js:
    main_js = main_js.replace(pw_logic_old, pw_logic_new)
    # Also fix the avatar variable name
    main_js = main_js.replace("pwAvatar.innerHTML = a.startsWith('data:') ? `<img src=\"${a}\" style=\"width:24px;height:24px;border-radius:50%;vertical-align:middle;\">` : a;", "pwAvatar.innerHTML = aHtml;")

# 3. Add Achievements Checker
ach_func = """
    window.checkAchievements = function() {
      let achs = JSON.parse(localStorage.getItem('drag0n_achievements') || '[]');
      let xp = parseInt(localStorage.getItem('drag0n_xp') || '0');
      let level = Math.floor(Math.sqrt(xp / 100)) + 1;
      
      let newAch = null;
      if(level >= 5 && !achs.includes('Level 5')) newAch = 'Level 5';
      if(level >= 10 && !achs.includes('Level 10')) newAch = 'Level 10';
      
      if(newAch) {
        achs.push(newAch);
        localStorage.setItem('drag0n_achievements', JSON.stringify(achs));
        alert('🏆 Achievement Unlocked: ' + newAch);
        if(window.updateProfileWidget) window.updateProfileWidget();
      }
    };
"""
if "window.checkAchievements =" not in main_js:
    main_js += ach_func

with open("assets/js/main.js", "w") as f:
    f.write(main_js)

# 4. Add Whiteboard to index.html and link to Shop
with open("index.html", "r") as f:
    idx = f.read()

shop_btn = '<a href="shop.html" style="position: absolute; top: 2rem; right: 300px; text-decoration: none; font-size: 1.2rem; color: #fbbf24; z-index: 100000; font-weight:bold;">🛒 Shop</a>'
if "shop.html" not in idx:
    idx = idx.replace('<!-- THEME TOGGLE -->', shop_btn + '\n  <!-- THEME TOGGLE -->')

whiteboard_html = """
      <!-- GLOBAL WHITEBOARD -->
      <div class="glass-card" style="grid-column: 1 / -1; margin-top: 2rem; text-align: center;">
        <h2>🎨 Global Whiteboard</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Draw something together! Updates live for everyone.</p>
        <canvas id="whiteboard-canvas" width="600" height="300" style="background: rgba(255,255,255,0.1); border: 2px solid var(--border); border-radius: 8px; cursor: crosshair; touch-action: none; max-width:100%;"></canvas>
        <div style="margin-top: 10px;">
          <input type="color" id="wb-color" value="#38bdf8" style="width: 50px; height: 30px; border:none; cursor:pointer;">
          <button onclick="document.getElementById('whiteboard-canvas').getContext('2d').clearRect(0,0,600,300); if(typeof firebase !== 'undefined') firebase.database().ref('whiteboard').remove();" style="padding: 5px 10px; font-size: 0.9rem; margin-left: 10px;">Clear Canvas</button>
        </div>
      </div>
"""
if "whiteboard-canvas" not in idx:
    idx = idx.replace('</section>', whiteboard_html + '\n    </section>')
    with open("index.html", "w") as f:
        f.write(idx)

# 5. Add Whiteboard logic to main.js
wb_logic = """
    // GLOBAL WHITEBOARD
    const canvas = document.getElementById('whiteboard-canvas');
    if (canvas && typeof firebase !== 'undefined') {
      const ctx = canvas.getContext('2d');
      let drawing = false;
      let colorInp = document.getElementById('wb-color');
      
      canvas.addEventListener('mousedown', () => drawing = true);
      canvas.addEventListener('mouseup', () => drawing = false);
      canvas.addEventListener('mouseleave', () => drawing = false);
      
      canvas.addEventListener('mousemove', (e) => {
        if(!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        
        const color = colorInp.value;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 4, 4);
        
        firebase.database().ref('whiteboard').push({x, y, color});
      });
      
      // Receive pixels
      firebase.database().ref('whiteboard').on('child_added', snap => {
        const p = snap.val();
        if(p && p.x != null && p.y != null) {
          ctx.fillStyle = p.color || '#fff';
          ctx.fillRect(p.x, p.y, 4, 4);
        }
      });
      firebase.database().ref('whiteboard').on('child_removed', () => {
        ctx.clearRect(0,0,canvas.width,canvas.height);
      });
    }
"""
with open("assets/js/main.js", "a") as f:
    if "// GLOBAL WHITEBOARD" not in open("assets/js/main.js").read():
        f.write("\n" + wb_logic)
EOF
