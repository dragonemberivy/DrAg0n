import os

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

head_part = lines[:44]
club_poll_part = lines[44:208]
middle_part = lines[208:736]
footer_part = lines[736:]

# Create club.html
club_html = []
club_html.extend(head_part)
club_html.extend(club_poll_part)
club_html.append('  </main>\n')

# Append scripts for club.html
script_start = -1
for i, line in enumerate(lines):
    if '<!-- Firebase -->' in line:
        script_start = i
        break

if script_start != -1:
    club_html.extend(lines[script_start:])

with open('club.html', 'w', encoding='utf-8') as f:
    f.writelines(club_html)

# Update index.html
index_html = []
index_html.extend(head_part)
index_html.extend(middle_part)

button_html = """
    <!-- GO TO CLUB BUTTON -->
    <div style="text-align: center; margin-top: 2rem; margin-bottom: 4rem;">
      <a href="club.html" style="background: linear-gradient(45deg, #a855f7, #ec4899); color: white; padding: 15px 30px; border-radius: 8px; font-size: 1.5rem; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 5px 15px rgba(236, 72, 153, 0.4); transition: transform 0.2s;">Enter Book Club & Polls ➔</a>
    </div>
"""
index_html.append(button_html)
index_html.extend(footer_part)

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(index_html)

print("Split successful.")
