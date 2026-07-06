with open("index.html", "r") as f:
    content = f.read()

firebase_scripts = """
  <!-- Firebase -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
"""

if "firebase-app-compat" not in content:
    content = content.replace("<!-- ALL SCRIPTS (Consolidated) -->", firebase_scripts + "\n  <!-- ALL SCRIPTS (Consolidated) -->")
    with open("index.html", "w") as f:
        f.write(content)

with open("assets/js/main.js", "r") as f:
    main = f.read()

# Make sure firebase initialization doesn't crash on pages without it (like games.html)
if "if (typeof firebase !== 'undefined' && !firebase.apps.length) {" not in main:
    main = main.replace(
        """    firebase.initializeApp({
      apiKey: "AIzaSyCDSYPrpnXW1ci2qLrDXvQsmsH9OmUVVFs",
      authDomain: "drag0n-chat.firebaseapp.com",
      databaseURL: "https://drag0n-chat-default-rtdb.firebaseio.com",
      projectId: "drag0n-chat",
      storageBucket: "drag0n-chat.firebasestorage.app",
      messagingSenderId: "44918974111",
      appId: "1:44918974111:web:e10a2665b161f3a22c"
    });""",
        """    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: "AIzaSyCDSYPrpnXW1ci2qLrDXvQsmsH9OmUVVFs",
          authDomain: "drag0n-chat.firebaseapp.com",
          databaseURL: "https://drag0n-chat-default-rtdb.firebaseio.com",
          projectId: "drag0n-chat",
          storageBucket: "drag0n-chat.firebasestorage.app",
          messagingSenderId: "44918974111",
          appId: "1:44918974111:web:e10a2665b161f3a22c"
        });
      }
    }"""
    )
    with open("assets/js/main.js", "w") as f:
        f.write(main)

