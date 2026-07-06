import json
import urllib.request
import urllib.parse
import time
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

titles = [
    "The Hunger Games", "I Am Malala", "The Count of Monte Cristo", "A Wrinkle in Time", 
    "The Hobbit", "Ender's Game", "The Giver", "Legendborn", "The Golden Compass", 
    "Divergent", "Dry", "City of Bones", "A Murder Most Unladylike", "Coraline", 
    "Wonder", "Truly Devious", "Amari and the Night Brothers", "The Book Thief", 
    "Legend", "Scythe", "Cinder", "The Outsiders", "The First Adventure", 
    "A Series of Unfortunate Events", "The Graveyard Book", "Bridge to Terabithia", 
    "Out of My Mind", "Shadow and Bone", "The Lightning Queen", "Throne of glass"
]

results = []
for title in titles:
    query = urllib.parse.quote(title)
    url = f"https://openlibrary.org/search.json?title={query}&limit=1"
    img_url = "https://images.unsplash.com/photo-1544716278-e513176f20b5?w=150&q=80" # fallback
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
            docs = data.get("docs", [])
            if docs:
                cover_i = docs[0].get("cover_i")
                if cover_i:
                    img_url = f"https://covers.openlibrary.org/b/id/{cover_i}-M.jpg"
    except Exception as e:
        print(f"Error for {title}: {e}")
        
    results.append({"title": title, "img": img_url})
    time.sleep(1) # Be nice to openlibrary

print(json.dumps(results, indent=2))
