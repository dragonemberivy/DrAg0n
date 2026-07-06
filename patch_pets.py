import re

# 1. Update shop.html
with open("shop.html", "r") as f:
    shop_html = f.read()

new_shop_items = """
      <div class="shop-item" onclick="window.buyItem('pet', 'dragon', 1000)">
        <div style="font-size: 3rem;">🐉</div>
        <h3>Pet Dragon</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">A tiny dragon that floats next to your profile.</p>
        <div class="shop-price">1000 DC</div>
      </div>

      <div class="shop-item" onclick="window.buyItem('pet', 'robot', 800)">
        <div style="font-size: 3rem;">🤖</div>
        <h3>Pet Robot</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">A loyal bot companion.</p>
        <div class="shop-price">800 DC</div>
      </div>
      
      <div class="shop-item" onclick="window.createClan()">
        <div style="font-size: 3rem;">🛡️</div>
        <h3>Found a Clan</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Get a custom [TAG] next to your name.</p>
        <div class="shop-price">2000 DC</div>
      </div>
"""

if "Pet Dragon" not in shop_html:
    shop_html = shop_html.replace('</main>', new_shop_items + '\n  </main>')
    
    clan_script = """
      window.createClan = function() {
        let dc = parseInt(localStorage.getItem('drag0n_dc') || '0');
        if (dc >= 2000) {
          const tag = prompt("Enter a 3-4 letter Clan Tag:");
          if (tag && tag.length >= 2 && tag.length <= 4) {
            dc -= 2000;
            localStorage.setItem('drag0n_dc', dc);
            
            let unlocked = JSON.parse(localStorage.getItem('drag0n_purchases') || '{}');
            unlocked['clan'] = tag.toUpperCase();
            localStorage.setItem('drag0n_purchases', JSON.stringify(unlocked));
            
            if(typeof firebase !== 'undefined' && localStorage.getItem('drag0n_user')) {
              firebase.database().ref('users/' + localStorage.getItem('drag0n_user').toLowerCase() + '/dc').set(dc);
              firebase.database().ref('users/' + localStorage.getItem('drag0n_user').toLowerCase() + '/purchases').set(unlocked);
            }
            alert('Clan created successfully!');
            window.updateShopBalance();
          }
        } else {
          alert('Not enough DC to found a Clan!');
        }
      };
"""
    shop_html = shop_html.replace('</script>\n</body>', clan_script + '\n</script>\n</body>')
    with open("shop.html", "w") as f:
        f.write(shop_html)

# 2. Update main.js for Pets, Clans, and Trivia
with open("assets/js/main.js", "r") as f:
    main_js = f.read()

pw_logic_old = """let vipBadge = purchases.badge === 'vip' ? '👑' : '';"""
pw_logic_new = """
        let vipBadge = purchases.badge === 'vip' ? '👑' : '';
        let clanTag = purchases.clan ? `<span style="color:#a855f7; font-size:0.7rem; font-weight:bold;">[${purchases.clan}]</span> ` : '';
        let pet = purchases.pet === 'dragon' ? '🐉' : purchases.pet === 'robot' ? '🤖' : '';
        if(pet) {
          if(!document.getElementById('profile-pet')) {
            const petEl = document.createElement('div');
            petEl.id = 'profile-pet';
            petEl.style.cssText = 'position:absolute; top:-15px; right:-15px; font-size:1.5rem; animation: float 3s ease-in-out infinite; pointer-events:none; z-index:100;';
            document.getElementById('drag0n-profile-widget').appendChild(petEl);
          }
          document.getElementById('profile-pet').innerText = pet;
        }
"""
if "let clanTag" not in main_js:
    main_js = main_js.replace(pw_logic_old, pw_logic_new)
    main_js = main_js.replace('${vipBadge}${u}', '${clanTag}${vipBadge}${u}')

chat_render_old = """div.innerHTML = `<span style="margin-right: 5px; font-size: 1.2rem;">${avatarHtml}</span><strong style="color: ${color}; cursor:pointer;" onclick="window.openDM('${escapedUsername}')">${escapedUsername}:</strong> ${escapedText}`;"""
chat_render_new = """
    const msgClan = msg.clan ? `<span style="color:#a855f7; font-size:0.7rem; font-weight:bold;">[${msg.clan}]</span> ` : '';
    div.innerHTML = `<span style="margin-right: 5px; font-size: 1.2rem;">${avatarHtml}</span><strong style="color: ${color}; cursor:pointer;" onclick="window.openDM('${escapedUsername}')">${msgClan}${escapedUsername}:</strong> ${escapedText}`;
"""
if "msgClan" not in main_js:
    main_js = main_js.replace(chat_render_old, chat_render_new)

chat_send_old = """
      firebase.database().ref('animal_chat').push({
        username: u,
        avatar: a,
        text: text,
        timestamp: Date.now()
      });
"""
chat_send_new = """
      let purchases = JSON.parse(localStorage.getItem('drag0n_purchases') || '{}');
      firebase.database().ref('animal_chat').push({
        username: u,
        avatar: a,
        text: text,
        clan: purchases.clan || '',
        timestamp: Date.now()
      });
      checkTriviaAnswer(text);
"""
if "checkTriviaAnswer(text)" not in main_js:
    main_js = main_js.replace(chat_send_old, chat_send_new)

trivia_logic = """
    // TRIVIA BOT
    let currentTrivia = null;
    const triviaQuestions = [
      { q: "What is the capital of France?", a: "paris" },
      { q: "What planet is known as the Red Planet?", a: "mars" },
      { q: "What is the largest mammal?", a: "blue whale" },
      { q: "How many legs does a spider have?", a: "8" }
    ];
    
    function startTrivia() {
      if(typeof firebase === 'undefined') return;
      const t = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
      firebase.database().ref('trivia_active').set({ q: t.q, a: t.a, timestamp: Date.now() });
      firebase.database().ref('animal_chat').push({
        username: 'TriviaBot',
        avatar: '🤖',
        text: `TRIVIA TIME! ${t.q} (First to answer wins 50 XP & 50 DC!)`,
        color: '#fbbf24',
        timestamp: Date.now()
      });
    }
    
    // Listen for active trivia
    if(typeof firebase !== 'undefined') {
      firebase.database().ref('trivia_active').on('value', snap => {
        currentTrivia = snap.val();
      });
    }
    
    window.checkTriviaAnswer = function(text) {
      if(!currentTrivia) return;
      if(text.toLowerCase() === currentTrivia.a.toLowerCase()) {
        firebase.database().ref('animal_chat').push({
          username: 'TriviaBot',
          avatar: '🤖',
          text: `🎉 WINNER! ${localStorage.getItem('drag0n_user')} answered correctly!`,
          color: '#fbbf24',
          timestamp: Date.now()
        });
        if(window.addXP) window.addXP(50);
        let currentDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        localStorage.setItem('drag0n_dc', currentDC + 50);
        firebase.database().ref('trivia_active').remove();
      }
    };
    
    // Start trivia occasionally if host
    setInterval(() => {
      if(localStorage.getItem('drag0n_owner') === 'true' && !currentTrivia) {
        if(Math.random() < 0.1) startTrivia();
      }
    }, 60000);
"""
if "TRIVIA BOT" not in main_js:
    main_js += "\n" + trivia_logic

with open("assets/js/main.js", "w") as f:
    f.write(main_js)

