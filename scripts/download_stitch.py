import json
import urllib.request
import os

input_file = r"C:\Users\ratta\.gemini\antigravity\brain\93c84bcf-d4f7-4669-a07d-6968b00fecec\.system_generated\steps\13\output.txt"
output_dir = r"d:\WebProject\Affiliate Comparison Platform\frontend\stitch_screens"

os.makedirs(output_dir, exist_ok=True)

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

for screen in data.get("screens", []):
    title = screen.get("title", "Untitled").replace(":", "").replace(" ", "_").replace("&", "and")
    url = screen.get("htmlCode", {}).get("downloadUrl")
    if url:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        print(f"Downloading {title}...")
        try:
            with urllib.request.urlopen(req) as response:
                html = response.read().decode('utf-8')
                out_path = os.path.join(output_dir, f"{title}.html")
                with open(out_path, "w", encoding='utf-8') as out:
                    out.write(html)
                print(f"Saved to {out_path}")
        except Exception as e:
            print(f"Failed to download {title}: {e}")
