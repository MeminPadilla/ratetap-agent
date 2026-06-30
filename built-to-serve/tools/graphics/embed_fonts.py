# Genera fonts/fonts.css con las tipografías embebidas en base64 (data URI).
# Así el render no depende de internet. Fuentes: Google Fonts (OFL).
import base64, os
BASE = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(BASE, "fonts")

def b(name):
    return base64.b64encode(open(os.path.join(F, name), "rb").read()).decode()

css = f"""
@font-face{{font-family:'Marker';src:url(data:font/woff2;base64,{b('marker.woff2')}) format('woff2');font-weight:400;font-display:block;}}
@font-face{{font-family:'Hand';src:url(data:font/woff2;base64,{b('kalam400.woff2')}) format('woff2');font-weight:400;font-display:block;}}
@font-face{{font-family:'Hand';src:url(data:font/woff2;base64,{b('kalam700.woff2')}) format('woff2');font-weight:700;font-display:block;}}
@font-face{{font-family:'Caveat';src:url(data:font/woff2;base64,{b('caveat400.woff2')}) format('woff2');font-weight:400;font-display:block;}}
"""
open(os.path.join(F, "fonts.css"), "w").write(css)
print("fonts/fonts.css generado:", len(css), "bytes")
