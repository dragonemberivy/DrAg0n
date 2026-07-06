import re

# Update main.js for Global Jukebox
with open("assets/js/main.js", "r") as f:
    main_js = f.read()

lofi_html_old = """
      document.body.insertAdjacentHTML('beforeend', `
        <div id="lofi-player" style="position:fixed; bottom:20px; right:20px; width:300px; background:rgba(0,0,0,0.7); backdrop-filter:blur(10px); border:1px solid var(--border); border-radius:12px; padding:15px; z-index:100000; box-shadow:0 10px 30px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--accent); font-size:1.1rem;">🎧 Lofi Radio</strong>
            <button onclick="document.getElementById('lofi-player').style.display='none'" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer;">&times;</button>
          </div>
          <iframe width="100%" height="80" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=${isPlaying ? 1 : 0}&loop=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="border-radius:8px;"></iframe>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
            <span>Status: ${isPlaying ? 'Playing' : 'Paused'}</span>
            <button onclick="window.toggleLofi()" style="background:rgba(255,255,255,0.1); border:none; color:white; padding:5px 10px; border-radius:4px; cursor:pointer;">${isPlaying ? 'Pause' : 'Play'}</button>
          </div>
        </div>
      `);
"""

jukebox_html_new = """
      document.body.insertAdjacentHTML('beforeend', `
        <div id="lofi-player" style="position:fixed; bottom:20px; right:20px; width:300px; background:rgba(0,0,0,0.7); backdrop-filter:blur(10px); border:1px solid var(--border); border-radius:12px; padding:15px; z-index:100000; box-shadow:0 10px 30px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--accent); font-size:1.1rem;">🎧 Global Jukebox</strong>
            <button onclick="document.getElementById('lofi-player').style.display='none'" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer;">&times;</button>
          </div>
          <iframe id="jukebox-iframe" width="100%" height="80" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=${isPlaying ? 1 : 0}&loop=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="border-radius:8px;"></iframe>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
            <span>Status: ${isPlaying ? 'Playing' : 'Paused'}</span>
            <button onclick="window.toggleLofi()" style="background:rgba(255,255,255,0.1); border:none; color:white; padding:5px 10px; border-radius:4px; cursor:pointer;">${isPlaying ? 'Pause' : 'Play'}</button>
          </div>
          <div style="display:flex; gap:5px; margin-top:5px;">
            <input type="text" id="jukebox-input" placeholder="YouTube Video ID" style="flex:1; padding:5px; background:rgba(0,0,0,0.5); border:1px solid var(--border); color:white; border-radius:4px; font-size:0.8rem;">
            <button onclick="window.queueSong()" style="background:var(--accent); border:none; padding:5px; color:white; border-radius:4px; cursor:pointer; font-size:0.8rem;">Queue (50 DC)</button>
          </div>
        </div>
      `);
      
      // Jukebox Sync
      if(typeof firebase !== 'undefined') {
        firebase.database().ref('global_jukebox').on('value', snap => {
          const s = snap.val();
          if(s && s.videoId) {
            const iframe = document.getElementById('jukebox-iframe');
            if(iframe) {
              const currentSrc = iframe.src;
              if(!currentSrc.includes(s.videoId)) {
                iframe.src = `https://www.youtube.com/embed/${s.videoId}?autoplay=${sessionStorage.getItem('lofi_playing')==='true' ? 1 : 0}&loop=1`;
              }
            }
          }
        });
      }
"""
if "Global Jukebox" not in main_js:
    main_js = main_js.replace(lofi_html_old, jukebox_html_new)
    
    jukebox_queue_logic = """
    window.queueSong = function() {
      let dc = parseInt(localStorage.getItem('drag0n_dc') || '0');
      if (dc >= 50) {
        const vid = document.getElementById('jukebox-input').value.trim();
        if(vid.length > 5) {
          dc -= 50;
          localStorage.setItem('drag0n_dc', dc);
          if(window.updateShopBalance) window.updateShopBalance();
          
          if(typeof firebase !== 'undefined') {
            firebase.database().ref('global_jukebox').set({ videoId: vid, timestamp: Date.now() });
            firebase.database().ref('animal_chat').push({
              username: 'Jukebox',
              avatar: '🎵',
              text: `${localStorage.getItem('drag0n_user')} queued a new song!`,
              color: '#38bdf8',
              timestamp: Date.now()
            });
          }
          alert('Song queued globally!');
        } else {
          alert('Invalid YouTube Video ID (e.g. jfKfPfyJRdk)');
        }
      } else {
        alert('Not enough DC to queue a song!');
      }
    };
"""
    main_js += "\n" + jukebox_queue_logic
    with open("assets/js/main.js", "w") as f:
        f.write(main_js)

EOF
