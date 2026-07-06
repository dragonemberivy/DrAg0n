import re

with open("assets/js/main.js", "r") as f:
    content = f.read()

# Replace getDailyPassword
old_func = """    function getDailyPassword() {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = dayNames[new Date().getDay()];
      const passwords = {
        "Monday": "pistachio",
        "Tuesday": "mango",
        "Wednesday": "strawberry",
        "Thursday": "mint",
        "Friday": "guava",
        "Saturday": "vanilla",
        "Sunday": "chocolate"
      };
      return passwords[today];
    }"""

new_func = """    function getDailyPasswords() {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = dayNames[new Date().getDay()];
      const visitor = {
        "Monday": "pistachio",
        "Tuesday": "mango",
        "Wednesday": "strawberry",
        "Thursday": "mint",
        "Friday": "guava",
        "Saturday": "vanilla",
        "Sunday": "chocolate"
      }[today];
      const owner = {
        "Monday": "rose",
        "Tuesday": "tulip",
        "Wednesday": "daisy",
        "Thursday": "sunflower",
        "Friday": "lily",
        "Saturday": "orchid",
        "Sunday": "lotus"
      }[today];
      return { visitor, owner };
    }"""

content = content.replace(old_func, new_func)

# Replace tryUnlock
old_try = """    function tryUnlock() {
      const pw = sitePwInput.value.toLowerCase().trim();
      if (pw === getDailyPassword()) {
        siteModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
      } else {
        sitePwError.style.display = 'block';
        sitePwInput.value = '';
        sitePwInput.focus();
      }
    }"""

new_try = """    function tryUnlock() {
      const pw = sitePwInput.value.toLowerCase().trim();
      const pws = getDailyPasswords();
      
      if (pw === pws.owner) {
        // Owner Mode
        localStorage.setItem('drag0n_owner', 'true');
        siteModal.style.display = 'none';
        document.body.style.overflow = 'auto';
      } else if (pw === pws.visitor) {
        // Visitor Mode
        localStorage.setItem('drag0n_owner', 'false');
        siteModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Track Visitor
        if (!sessionStorage.getItem('visited_today')) {
          const dateStr = new Date().toISOString().split('T')[0];
          const dbRef = firebase.database().ref('analytics/daily_visits/' + dateStr);
          dbRef.transaction((current_value) => {
            return (current_value || 0) + 1;
          });
          sessionStorage.setItem('visited_today', 'true');
        }
        
        // Redirect to register if no account
        if (!localStorage.getItem('drag0n_user') && window.location.pathname.endsWith('index.html')) {
          window.location.href = 'register.html';
        }
      } else {
        sitePwError.style.display = 'block';
        sitePwInput.value = '';
        sitePwInput.focus();
      }
    }"""

content = content.replace(old_try, new_try)

# Add showstats listener
showstats = """
    // SHOWSTATS COMMAND
    let adminKeys = '';
    document.addEventListener('keydown', (e) => {
      adminKeys += e.key.toLowerCase();
      adminKeys = adminKeys.slice(-9);
      if (adminKeys === 'showstats') {
        if (localStorage.getItem('drag0n_owner') === 'true') {
          const dateStr = new Date().toISOString().split('T')[0];
          firebase.database().ref('analytics/daily_visits/' + dateStr).once('value').then((snapshot) => {
            const count = snapshot.val() || 0;
            alert(`Owner Mode: There have been ${count} visitors today (${dateStr}).`);
          });
        } else {
          alert('Access Denied. You are not the owner.');
        }
      }
    });
"""

content += showstats

with open("assets/js/main.js", "w") as f:
    f.write(content)
