import re

with open("assets/js/main.js", "r") as f:
    content = f.read()

# Fix createMemoryBoard call
content = re.sub(
    r"createMemoryBoard\(\);",
    r"if(document.getElementById('memory-game')) createMemoryBoard();",
    content
)

# Fix COLOR SVG section
color_svg_old = """    rSlider.oninput = gSlider.oninput = bSlider.oninput = updatePreview;
    updatePreview();

    document.querySelectorAll(".colorable").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        undoStack.push({ element: el, oldColor: el.getAttribute("fill") });
        el.setAttribute("fill", getCurrentColor());
      });
    });

    document.getElementById("undoBtn").onclick = () => {
      if (undoStack.length === 0) return;
      const last = undoStack.pop();
      last.element.setAttribute("fill", last.oldColor || '#fff');
    };"""

color_svg_new = """    if (rSlider && gSlider && bSlider && colorPreview) {
      rSlider.oninput = gSlider.oninput = bSlider.oninput = updatePreview;
      updatePreview();

      document.querySelectorAll(".colorable").forEach(el => {
        el.addEventListener("click", e => {
          e.stopPropagation();
          undoStack.push({ element: el, oldColor: el.getAttribute("fill") });
          el.setAttribute("fill", getCurrentColor());
        });
      });

      const undoBtn = document.getElementById("undoBtn");
      if (undoBtn) {
        undoBtn.onclick = () => {
          if (undoStack.length === 0) return;
          const last = undoStack.pop();
          last.element.setAttribute("fill", last.oldColor || '#fff');
        };
      }
    }"""

content = content.replace(color_svg_old, color_svg_new)

# Fix setupEmojiHunt
emoji_hunt_old = """    function setupEmojiHunt(boxId, scoreId, emojisList, targetCount, secretCode) {
      const container = document.getElementById(boxId);
      const scoreDisp = document.getElementById(scoreId);
      const popSound = document.getElementById('pop-sound');"""

emoji_hunt_new = """    function setupEmojiHunt(boxId, scoreId, emojisList, targetCount, secretCode) {
      const container = document.getElementById(boxId);
      const scoreDisp = document.getElementById(scoreId);
      const popSound = document.getElementById('pop-sound');
      if (!container || !scoreDisp || !popSound) return;"""

content = content.replace(emoji_hunt_old, emoji_hunt_new)


with open("assets/js/main.js", "w") as f:
    f.write(content)
