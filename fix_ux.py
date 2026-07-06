import re
import os

# 1. Update main.js to save session unlocked state
with open("assets/js/main.js", "r") as f:
    main_js = f.read()

# Add sessionStorage.setItem('site_unlocked', 'true');
main_js = main_js.replace(
    "localStorage.setItem('drag0n_owner', 'true');",
    "localStorage.setItem('drag0n_owner', 'true');\n        sessionStorage.setItem('site_unlocked', 'true');"
)
main_js = main_js.replace(
    "localStorage.setItem('drag0n_owner', 'false');",
    "localStorage.setItem('drag0n_owner', 'false');\n        sessionStorage.setItem('site_unlocked', 'true');"
)

# Add load check
unlock_check = """
    if (siteModal && sessionStorage.getItem('site_unlocked') === 'true') {
      siteModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
"""
if "sessionStorage.getItem('site_unlocked') === 'true'" not in main_js:
    # insert before window.addEventListener('load'
    main_js = main_js.replace(
        "window.addEventListener('load', () => {",
        unlock_check + "\n    window.addEventListener('load', () => {"
    )

with open("assets/js/main.js", "w") as f:
    f.write(main_js)

# 2. Add Back button to other pages
back_btn = '<a href="index.html" style="position: absolute; top: 2rem; left: 2rem; text-decoration: none; font-size: 1.2rem; color: var(--accent); z-index: 100000;">← Return to Home</a>'

for page in ["games.html", "space-game.html", "club.html"]:
    if os.path.exists(page):
        with open(page, "r") as f:
            content = f.read()
        
        if "Return to Home" not in content and "Back Home" not in content:
            # insert right after <body>
            content = re.sub(r'(<body[^>]*>)', r'\1\n  ' + back_btn, content)
            with open(page, "w") as f:
                f.write(content)

