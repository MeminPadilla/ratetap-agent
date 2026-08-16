# Embebe las fuentes en fonts/fonts.css (base64, sin depender de internet).
# Fuentes: Playfair Display (700, 700 italic) + Inter (400, 600). Licencia OFL.
import base64, os
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
b = lambda n: base64.b64encode(open(os.path.join(F, n), "rb").read()).decode()
css = f"""
@font-face{{font-family:'Playfair';src:url(data:font/woff2;base64,{b('playfair700.woff2')}) format('woff2');font-weight:700;font-style:normal;font-display:block;}}
@font-face{{font-family:'Playfair';src:url(data:font/woff2;base64,{b('playfair700i.woff2')}) format('woff2');font-weight:700;font-style:italic;font-display:block;}}
@font-face{{font-family:'Sans';src:url(data:font/woff2;base64,{b('inter400.woff2')}) format('woff2');font-weight:400;font-display:block;}}
@font-face{{font-family:'Sans';src:url(data:font/woff2;base64,{b('inter600.woff2')}) format('woff2');font-weight:600;font-display:block;}}
"""
open(os.path.join(F, "fonts.css"), "w").write(css)
print("fonts/fonts.css generado:", len(css), "bytes")
