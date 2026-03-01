import os
import re

html_dir = r"d:\WebProject\Affiliate Comparison Platform\frontend\stitch_screens"
out_dir = r"d:\WebProject\Affiliate Comparison Platform\frontend\src\app"

def convert_html_to_jsx(html):
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    if body_match:
        content = body_match.group(1)
    else:
        content = html

    content = re.sub(r'\bclass=', 'className=', content)
    content = re.sub(r'\bfor=', 'htmlFor=', content)
    content = re.sub(r'\bxmlns:svg=', 'xmlnsXlink=', content)
    
    # Simple camelCase converter for SVG properties like stroke-width
    def kebab_to_camel(match):
        return match.group(1) + match.group(2).upper()

    content = re.sub(r'\b(stroke|fill|stroke-linecap|stroke-linejoin|stroke-width|clip-rule|fill-rule)-([a-z])', kebab_to_camel, content)

    def style_replacer(match):
        style_str = match.group(1)
        styles = []
        for prop in style_str.split(';'):
            if ':' not in prop: continue
            k, v = prop.split(':', 1)
            k = k.strip()
            k = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
            v = v.strip().replace('"', '\\"')
            styles.append(f'{k}: "{v}"')
        return 'style={{' + ', '.join(styles) + '}}'
    
    content = re.sub(r'style="([^"]*)"', style_replacer, content)
    content = re.sub(r'<(img|input|br|hr)([^>]*?)(?<!/)>', r'<\1\2 />', content)
    content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', content, flags=re.DOTALL)
    
    # Fix the generic `stroke-width` -> `strokeWidth`, `stroke-linecap` -> `strokeLinecap`
    content = content.replace('stroke-width', 'strokeWidth')
    content = content.replace('stroke-linecap', 'strokeLinecap')
    content = content.replace('stroke-linejoin', 'strokeLinejoin')
    content = content.replace('fill-rule', 'fillRule')
    content = content.replace('clip-rule', 'clipRule')
    content = content.replace('viewBox', 'viewBox') # already camelCase in React but sometimes lowercase in HTML

    return content


files_to_process = {
    "Tech_Affiliate_Homepage.html": ("page.tsx", "HomePage"),
    "Category_Trading_Monitors.html": ("category/[slug]/page.tsx", "CategoryPage"),
    "Product_Specs_and_Price_Trends.html": ("product/[id]/page.tsx", "ProductPage"),
    "Tech_Comparison_Dashboard.html": ("compare/page.tsx", "ComparePage"),
    "AI_Setup_Builder_Tool.html": ("setup-builder/page.tsx", "SetupBuilderPage"),
    "Expertise_and_Methodology_Page.html": ("expertise/page.tsx", "ExpertisePage")
}

for html_file, (tsx_path, component_name) in files_to_process.items():
    in_path = os.path.join(html_dir, html_file)
    if not os.path.exists(in_path):
        print(f"Skipping {html_file}, not found.")
        continue
    
    with open(in_path, "r", encoding="utf-8") as f:
        html = f.read()
    
    jsx_content = convert_html_to_jsx(html)
    
    full_out_path = os.path.join(out_dir, tsx_path)
    os.makedirs(os.path.dirname(full_out_path), exist_ok=True)

    jsx_wrapper = f"""
export default function {component_name}() {{
  return (
    <>
      {jsx_content}
    </>
  );
}}
"""
    
    with open(full_out_path, "w", encoding="utf-8") as f:
        f.write(jsx_wrapper)
    print(f"Converted {html_file} -> {tsx_path}")

print("Done.")
