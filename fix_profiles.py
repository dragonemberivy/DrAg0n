import re

with open("assets/js/main.js", "r") as f:
    main_js = f.read()

# Modify Chat profile logic
chat_logic = """
    if(chatProfSel) { chatProfSel.addEventListener("change", () => {
      currentProfile = chatProfSel.value;
      chatInp.disabled = false;
      chatBtn.disabled = false;
      chatInp.placeholder = "Type a message...";
    }); }
"""

new_chat_logic = """
    const savedUser = localStorage.getItem('drag0n_user');
    const savedAvatar = localStorage.getItem('drag0n_avatar');

    if(chatProfSel) {
      if (savedUser) {
        // Auto-login to chat
        currentProfile = savedUser;
        chatProfSel.style.display = 'none'; // hide selector
        if(chatInp) chatInp.disabled = false;
        if(chatBtn) chatBtn.disabled = false;
        if(chatInp) chatInp.placeholder = "Type a message...";
      } else {
        chatProfSel.addEventListener("change", () => {
          currentProfile = chatProfSel.value;
          chatInp.disabled = false;
          chatBtn.disabled = false;
          chatInp.placeholder = "Type a message...";
        });
      }
    }
"""
main_js = main_js.replace(chat_logic, new_chat_logic)


# Modify Book Club logic
book_logic = """
    window.saveBookReview = function() {
      const usernameInput = document.getElementById('review-username');
      const textInput = document.getElementById('review-text');
      
      const username = usernameInput.value.trim() || 'Anonymous';
"""

new_book_logic = """
    // Pre-fill username if exists
    window.addEventListener('load', () => {
      const usernameInput = document.getElementById('review-username');
      if (usernameInput && localStorage.getItem('drag0n_user')) {
        usernameInput.value = localStorage.getItem('drag0n_user');
        usernameInput.disabled = true; // Lock it
      }
    });

    window.saveBookReview = function() {
      const usernameInput = document.getElementById('review-username');
      const textInput = document.getElementById('review-text');
      
      const username = localStorage.getItem('drag0n_user') || (usernameInput ? usernameInput.value.trim() : '') || 'Anonymous';
      const avatar = localStorage.getItem('drag0n_avatar') || '✨';
"""
main_js = main_js.replace(book_logic, new_book_logic)


# Modify Book club render logic
book_render = "div.innerHTML = `<strong style=\"color: #38bdf8;\">${escapedUsername}:</strong> ${escapedText}`;"
new_book_render = "div.innerHTML = `<span style=\"margin-right: 5px; font-size: 1.2rem;\">${avatar.startsWith('data:') ? '<img src=\"'+avatar+'\" style=\"width:20px;height:20px;border-radius:50%;vertical-align:middle;\">' : avatar}</span><strong style=\"color: #38bdf8;\">${escapedUsername}:</strong> ${escapedText}`;"
main_js = main_js.replace(book_render, new_book_render)

with open("assets/js/main.js", "w") as f:
    f.write(main_js)

