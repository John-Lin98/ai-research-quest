from pathlib import Path

path = Path("public/case-study-alphafold-casp14.html")
text = path.read_text(encoding="utf-8")

style_anchor = '      a:focus-visible { outline: 3px solid #f59e0b; outline-offset: 3px; }\n'
style_insert = style_anchor + '      .language-switch { position: fixed; z-index: 10; top: .8rem; right: .8rem; padding: .55rem .85rem; border: 1px solid #b8c7d9; border-radius: 999px; color: #0f3d56; background: rgba(255,255,255,.96); box-shadow: 0 6px 18px rgba(15,23,42,.1); text-decoration: none; }\n'
if '.language-switch {' not in text:
    if style_anchor not in text:
        raise SystemExit("missing blog style anchor")
    text = text.replace(style_anchor, style_insert, 1)

media_old = '      @media (max-width: 680px) { .hero { padding-top: 3rem; } .two-loop, .three-grid, .quadrants, .feedback-list, .handoff-grid { grid-template-columns: 1fr; } .bubble { max-width: 100%; } }'
media_new = '      @media (max-width: 680px) { .language-switch { position: absolute; top: .55rem; right: .55rem; } .hero { padding-top: 4.5rem; } .two-loop, .three-grid, .quadrants, .feedback-list, .handoff-grid { grid-template-columns: 1fr; } .bubble { max-width: 100%; } }'
if media_old in text:
    text = text.replace(media_old, media_new, 1)
elif media_new not in text:
    raise SystemExit("missing mobile media anchor")

body_anchor = '  <body>\n'
switch = '  <body>\n    <a class="language-switch" href="./en/case-study-alphafold-casp14.html" lang="en" aria-label="Switch to the English article">English</a>\n'
if 'aria-label="Switch to the English article"' not in text:
    if body_anchor not in text:
        raise SystemExit("missing body anchor")
    text = text.replace(body_anchor, switch, 1)

path.write_text(text, encoding="utf-8")
