import re

with open("assets/js/main.js", "r") as f:
    content = f.read()

# Fix siteUnlockBtn
content = re.sub(
    r"(siteUnlockBtn\.addEventListener\('click', tryUnlock\);)",
    r"if(siteUnlockBtn) { \1 }",
    content
)

# Fix sitePwInput
content = re.sub(
    r"(sitePwInput\.addEventListener\('keypress',[\s\S]*?\}\);)",
    r"if(sitePwInput) { \1 }",
    content
)

content = re.sub(
    r"(window\.addEventListener\('load', \(\) => \{\n\s*sitePwInput\.focus\(\);\n\s*\}\);)",
    r"window.addEventListener('load', () => {\n      if(sitePwInput) sitePwInput.focus();\n    });",
    content
)

# Fix chatRoomSel
content = re.sub(
    r"(chatRoomSel\.addEventListener\(\"change\", \(\) => \{[\s\S]*?\}\);)",
    r"if(chatRoomSel) { \1 }",
    content
)

# Fix modal-join-btn
content = re.sub(
    r"(document\.getElementById\('modal-join-btn'\)\.addEventListener[\s\S]*?\}\);)",
    r"if(document.getElementById('modal-join-btn')) { \1 }",
    content
)

# Fix modal-cancel-btn
content = re.sub(
    r"(document\.getElementById\('modal-cancel-btn'\)\.addEventListener[\s\S]*?\}\);)",
    r"if(document.getElementById('modal-cancel-btn')) { \1 }",
    content
)

# Fix pwInput
content = re.sub(
    r"(pwInput\.addEventListener\('keypress', \(e\) => \{[\s\S]*?\}\);)",
    r"if(pwInput) { \1 }",
    content
)

# Fix chatProfSel
content = re.sub(
    r"(chatProfSel\.addEventListener\(\"change\", \(\) => \{[\s\S]*?\}\);)",
    r"if(chatProfSel) { \1 }",
    content
)

# Fix chatBtn
content = re.sub(
    r"(chatBtn\.onclick = sendMessage;)",
    r"if(chatBtn) { \1 }",
    content
)

# Fix chatInp
content = re.sub(
    r"(chatInp\.onkeypress = e => \{ if \(e\.key === \"Enter\"\) sendMessage\(\); \};)",
    r"if(chatInp) { \1 }",
    content
)

# Fix clock update
content = re.sub(
    r"(document\.getElementById\('clock'\)\.textContent = )",
    r"const clockEl = document.getElementById('clock');\n      if(clockEl) clockEl.textContent = ",
    content
)

with open("assets/js/main.js", "w") as f:
    f.write(content)
