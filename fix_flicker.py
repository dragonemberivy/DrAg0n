with open("index.html", "r") as f:
    idx = f.read()

inline_script = """
  <!-- SITE-WIDE PASSWORD LOCK -->
  <script>
    if (sessionStorage.getItem('site_unlocked') === 'true') {
      document.write('<style>#site-password-modal { display: none !important; } body { overflow: auto !important; }</style>');
    }
  </script>
"""

if "<script>" not in idx.split("<!-- SITE-WIDE PASSWORD LOCK -->")[1]:
    idx = idx.replace("<!-- SITE-WIDE PASSWORD LOCK -->", inline_script)
    with open("index.html", "w") as f:
        f.write(idx)
