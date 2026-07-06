import re

with open("chat.html", "r") as f:
    chat_html = f.read()

dm_modal = """
  <!-- DIRECT MESSAGING MODAL -->
  <div id="dm-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:200000; align-items:center; justify-content:center;">
    <div class="glass-card" style="width: 90%; max-width: 500px; padding: 2rem; border-color: rgba(168, 85, 247, 0.4);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="margin: 0; color: #a855f7;">DM: <span id="dm-target-user" style="color:white;"></span></h2>
        <button onclick="document.getElementById('dm-modal').style.display='none';" style="background:transparent; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
      </div>
      
      <div id="dm-messages-container" class="messages-container" style="height: 300px; border: 1px solid var(--border); padding: 10px; overflow-y: auto; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 1rem; text-align: left;">
        <!-- DM messages load here -->
      </div>
      
      <form id="dm-form" style="display: flex; gap: 10px;">
        <input type="text" id="dm-input" placeholder="Type a private message..." required style="flex:1; padding:10px; background:rgba(0,0,0,0.5); border:1px solid #a855f7; color:white; border-radius:8px;">
        <button type="submit" style="padding:10px 20px; background:#a855f7; border:none; color:white; font-weight:bold; border-radius:8px; cursor:pointer;">Send</button>
      </form>
    </div>
  </div>
"""

if "dm-modal" not in chat_html:
    chat_html = chat_html.replace('</body>', dm_modal + '\n</body>')
    with open("chat.html", "w") as f:
        f.write(chat_html)


with open("assets/js/main.js", "r") as f:
    main_js = f.read()

# Update chat message rendering to allow clicking on names
chat_render_old = """
    div.innerHTML = `<span style="margin-right: 5px; font-size: 1.2rem;">${avatarHtml}</span><strong style="color: ${color};">${escapedUsername}:</strong> ${escapedText}`;
    target.appendChild(div);
"""
chat_render_new = """
    div.innerHTML = `<span style="margin-right: 5px; font-size: 1.2rem;">${avatarHtml}</span><strong style="color: ${color}; cursor:pointer;" onclick="window.openDM('${escapedUsername}')">${escapedUsername}:</strong> ${escapedText}`;
    target.appendChild(div);
"""
if "window.openDM" not in main_js:
    main_js = main_js.replace(chat_render_old, chat_render_new)
    
    dm_logic = """
    // DIRECT MESSAGING
    let currentDMUser = null;
    let dmListenerRef = null;
    
    window.openDM = function(targetUser) {
      const myUser = localStorage.getItem('drag0n_user');
      if(!myUser) return alert("You must create a profile to DM!");
      if(targetUser === myUser) return;
      
      currentDMUser = targetUser;
      document.getElementById('dm-target-user').innerText = targetUser;
      document.getElementById('dm-modal').style.display = 'flex';
      
      const container = document.getElementById('dm-messages-container');
      container.innerHTML = '';
      
      // Determine DM channel ID (alphabetical sort to ensure both users write to same path)
      const u1 = myUser.toLowerCase();
      const u2 = targetUser.toLowerCase();
      const dmId = u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;
      
      if(dmListenerRef) dmListenerRef.off();
      
      dmListenerRef = firebase.database().ref('dms/' + dmId);
      dmListenerRef.on('child_added', snap => {
        const msg = snap.val();
        if(msg) {
          const div = document.createElement('div');
          div.style.marginBottom = '5px';
          const isMe = msg.username === myUser;
          div.innerHTML = `<strong style="color: ${isMe ? '#a855f7' : '#fbbf24'};">${msg.username}:</strong> ${msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`;
          container.appendChild(div);
          container.scrollTop = container.scrollHeight;
        }
      });
    };
    
    const dmForm = document.getElementById('dm-form');
    if(dmForm) {
      dmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inp = document.getElementById('dm-input');
        const text = inp.value.trim();
        if(!text || !currentDMUser) return;
        
        const myUser = localStorage.getItem('drag0n_user');
        const u1 = myUser.toLowerCase();
        const u2 = currentDMUser.toLowerCase();
        const dmId = u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;
        
        firebase.database().ref('dms/' + dmId).push({
          username: myUser,
          text: text,
          timestamp: Date.now()
        });
        
        inp.value = '';
        if(window.addXP) window.addXP(5);
      });
    }
"""
    main_js += "\n" + dm_logic
    with open("assets/js/main.js", "w") as f:
        f.write(main_js)
