import re

with open("assets/js/main.js", "r") as f:
    content = f.read()

content = content.replace(
    'errorEl.textContent = "Network error. Try again."; errorEl.style.display = \'block\';',
    'errorEl.textContent = "Error: " + (e.message || "Network error"); errorEl.style.display = \'block\';'
)

with open("assets/js/main.js", "w") as f:
    f.write(content)
