import re

with open("index.html", "r") as f:
    idx = f.read()

profile_widget = """
    <div id="profile-widget" style="position: absolute; top: 2rem; right: 2rem; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); padding: 5px 15px; border-radius: 30px; border: 1px solid var(--border); cursor: pointer; z-index: 100000;">
      <span id="pw-avatar" style="font-size: 1.5rem;">👤</span>
      <span id="pw-name" style="font-weight: bold; color: var(--accent);">Create Profile</span>
    </div>
"""

idx = idx.replace('<div id="clock-container">', profile_widget + '\n    <div id="clock-container">')

modal_html = """
  <!-- REGISTRATION MODAL -->
  <div id="register-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.95); z-index:100001; align-items:center; justify-content:center; backdrop-filter:blur(10px); overflow-y: auto;">
    <div class="glass-card" style="text-align:center; min-width: 320px; max-width: 500px; transform: scale(1); box-shadow: 0 20px 50px rgba(168, 85, 247, 0.3); border: 1px solid rgba(168, 85, 247, 0.5);">
      <h2 style="font-size: 2rem; margin-bottom: 0.5rem; color: #fff;">Claim Your Name</h2>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem;">No passwords. No emails.</p>
      
      <div id="preview-avatar" style="font-size: 4rem; margin: 0 auto 1rem; width: 100px; height: 100px; line-height: 100px; border-radius: 50%; background: rgba(0,0,0,0.3); border: 2px solid var(--border); overflow: hidden;">✨</div>
      
      <input type="text" id="username-input" placeholder="e.g. StarDragon99" maxlength="20" style="text-align: center; font-weight: bold; font-size: 1.2rem;">
      <p id="username-error" style="color: #ef4444; font-size: 0.9rem; margin-top: -10px; margin-bottom: 15px; display: none; text-align: left;">Username taken!</p>

      <div style="display: flex; gap: 10px; margin-bottom: 10px;">
        <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
        <button onclick="document.getElementById('avatar-upload').click()" style="flex: 1; font-size: 0.9rem; padding: 0.5rem;">Upload Image</button>
      </div>

      <div class="avatar-grid" id="emoji-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; max-height: 150px; overflow-y: auto; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid var(--border); margin-bottom: 15px;">
        <!-- Emojis -->
      </div>

      <button id="create-account-btn" style="width: 100%; font-size: 1.2rem; padding: 15px; background: linear-gradient(135deg, #c084fc, #ec4899);">Enter Website</button>
      <button id="close-register-btn" style="width: 100%; margin-top: 10px; background: transparent; color: var(--text-muted); font-size: 0.9rem;">Close</button>
    </div>
  </div>
"""

idx = idx.replace('<!-- SITE-WIDE PASSWORD LOCK -->', modal_html + '\n  <!-- SITE-WIDE PASSWORD LOCK -->')

with open("index.html", "w") as f:
    f.write(idx)

# Now update main.js
with open("assets/js/main.js", "r") as f:
    main_js = f.read()

# Replace window.location.href = 'register.html';
main_js = main_js.replace(
    "window.location.href = 'register.html';",
    "const rm = document.getElementById('register-modal'); if(rm) rm.style.display = 'flex';"
)

register_logic = """
    // REGISTRATION LOGIC
    const profileWidget = document.getElementById('profile-widget');
    const registerModal = document.getElementById('register-modal');
    const pwName = document.getElementById('pw-name');
    const pwAvatar = document.getElementById('pw-avatar');
    
    function updateProfileWidget() {
      if(!profileWidget) return;
      const u = localStorage.getItem('drag0n_user');
      const a = localStorage.getItem('drag0n_avatar');
      if(u) {
        pwName.textContent = u;
        pwAvatar.innerHTML = a.startsWith('data:') ? `<img src="${a}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;">` : a;
      }
    }
    window.addEventListener('load', updateProfileWidget);
    
    if(profileWidget) {
      profileWidget.addEventListener('click', () => {
        if(!localStorage.getItem('drag0n_user')) {
          registerModal.style.display = 'flex';
        } else {
          alert('You are already registered as ' + localStorage.getItem('drag0n_user') + '!');
        }
      });
    }

    if(document.getElementById('close-register-btn')) {
      document.getElementById('close-register-btn').addEventListener('click', () => {
        registerModal.style.display = 'none';
      });
    }

    const emojiGrid = document.getElementById('emoji-grid');
    if (emojiGrid) {
      const emojis = ['🦊', '🐉', '🐱', '🐶', '🐙', '🐼', '🐨', '🐸', '🦁', '🐯', '🐰', '🐹', '🐻', '🐷', '🦄', '🐝', '🐢', '🐍', '🦕', '🦖', '🦈', '🐬', '🐧', '🦉', '🦋'];
      const preview = document.getElementById('preview-avatar');
      let selectedAvatar = '✨';

      emojis.forEach(e => {
        const div = document.createElement('div');
        div.style.cssText = 'font-size: 1.5rem; text-align: center; cursor: pointer; padding: 5px; border-radius: 8px; transition: all 0.2s; user-select: none;';
        div.textContent = e;
        div.onclick = () => {
          Array.from(emojiGrid.children).forEach(el => el.style.background = 'transparent');
          div.style.background = 'rgba(56, 189, 248, 0.2)';
          selectedAvatar = e;
          preview.innerHTML = e;
        };
        emojiGrid.appendChild(div);
      });

      const avatarUpload = document.getElementById('avatar-upload');
      if(avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
              const canvas = document.createElement('canvas');
              const max_size = 150;
              let width = img.width, height = img.height;
              if (width > height) { if (width > max_size) { height *= max_size / width; width = max_size; } } 
              else { if (height > max_size) { width *= max_size / height; height = max_size; } }
              canvas.width = width; canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              selectedAvatar = dataUrl;
              preview.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;">`;
              Array.from(emojiGrid.children).forEach(el => el.style.background = 'transparent');
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      }

      const createBtn = document.getElementById('create-account-btn');
      if(createBtn) {
        createBtn.addEventListener('click', async () => {
          const username = document.getElementById('username-input').value.trim();
          const errorEl = document.getElementById('username-error');
          if (!username) { errorEl.textContent = "Please enter a username!"; errorEl.style.display = 'block'; return; }
          if (!/^[a-zA-Z0-9_]+$/.test(username)) { errorEl.textContent = "Letters, numbers, and underscores only!"; errorEl.style.display = 'block'; return; }

          createBtn.disabled = true; createBtn.textContent = "Checking...";
          try {
            if (typeof firebase !== 'undefined') {
              const userRef = firebase.database().ref('users/' + username.toLowerCase());
              const snapshot = await userRef.once('value');
              if (snapshot.exists()) {
                errorEl.textContent = "Username is already taken!"; errorEl.style.display = 'block';
                createBtn.disabled = false; createBtn.textContent = "Enter Website";
              } else {
                await userRef.set({ username: username, avatar: selectedAvatar, created_at: Date.now() });
                localStorage.setItem('drag0n_user', username);
                localStorage.setItem('drag0n_avatar', selectedAvatar);
                registerModal.style.display = 'none';
                updateProfileWidget();
                
                // If they created an account from index page after lock
                const siteModal = document.getElementById('site-password-modal');
                if(siteModal && siteModal.style.display !== 'none') {
                  siteModal.style.display = 'none';
                  document.body.style.overflow = 'auto';
                }
              }
            }
          } catch(e) {
            errorEl.textContent = "Network error. Try again."; errorEl.style.display = 'block';
            createBtn.disabled = false; createBtn.textContent = "Enter Website";
          }
        });
      }
    }
"""

main_js += register_logic

with open("assets/js/main.js", "w") as f:
    f.write(main_js)

