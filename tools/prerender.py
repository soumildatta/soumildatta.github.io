#!/usr/bin/env python3
"""Bake the YAML in /content into index.html so crawlers that don't run JS
(most AI agents) still see the news, research, publications, etc.

Run after editing any content/*.yml:   python3 tools/prerender.py
Mirrors the templates in assets/site.js; site.js re-renders the same markup
in the browser, so the two should stay in sync.
"""
import html, re, sys
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"


def md(value):
    if value is None:
        return ""
    s = html.escape(str(value), quote=False)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(^|[^*])\*(?!\*)([^*]+)\*", r"\1<em>\2</em>", s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    return s


def load(name):
    return yaml.safe_load((ROOT / "content" / name).read_text())


def visible(items):
    return [i for i in items if not i.get("hidden")]


def news(items):
    return "".join(
        f'<li><span class="news-date">{md(n["date"])}</span><span class="news-text">{md(n["text"])}</span></li>'
        for n in visible(items)
    )


def research(items):
    out = []
    for i, c in enumerate(visible(items), 1):
        tags = "".join(f'<span class="tag">{md(t)}</span>' for t in c.get("tags", []))
        out.append(
            f'<article class="card"><span class="card-num">/{i:02d} &middot; {md(c.get("kicker"))}</span>'
            f'<h3>{md(c["title"])}</h3><p>{md(c["text"])}</p><div class="tags">{tags}</div></article>'
        )
    return "".join(out)


def pubs(items):
    out = []
    for p in visible(items):
        if p.get("link"):
            title = f'<a class="pub-title" href="{p["link"]}">{md(p["title"])}</a>'
        else:
            title = f'<span class="pub-title">{md(p["title"])}</span>'
        badges = ""
        if p.get("status"):
            badges += f'<span class="badge badge-review">{md(p["status"])}</span>'
        if p.get("venue"):
            badges += f'<span class="badge badge-venue">{md(p["venue"])}</span>'
        if p.get("award"):
            star = "☆" if re.search("nominee", p["award"], re.I) else "★"
            badges += f'<span class="badge badge-award">{star} {md(p["award"])}</span>'
        out.append(
            f'<li class="pub">{title}<p class="pub-authors">{md(p["authors"])}</p><div class="pub-meta">{badges}</div></li>'
        )
    return "".join(out)


def awards(items):
    out = []
    for a in visible(items):
        body = f'<a href="{a["link"]}">{md(a["text"])}</a>' if a.get("link") else md(a["text"])
        date = f'<span class="award-date">{md(a["date"])}</span>' if a.get("date") else ""
        out.append(f'<li><span class="marker">★</span><span>{body}</span>{date}</li>')
    return "".join(out)


def service(groups):
    out = []
    for g in groups:
        chips = "".join(
            f'<div class="venue-chip"><span class="v-name">{md(v["name"])}</span>'
            f'<span class="v-years">{md(v["years"])}</span><span class="v-full">{md(v["full"])}</span></div>'
            for v in g.get("venues", [])
        )
        out.append(f'<p class="service-intro">{md(g["heading"])}</p><div class="service-grid">{chips}</div>')
    return "".join(out)


def teaching(data):
    paras = "".join(f"<p>{md(p)}</p>" for p in data.get("paragraphs", []))
    link = data.get("link")
    tail = f'<p><a href="{link["url"]}">{md(link["text"])}</a></p>' if link else ""
    return paras + tail


SECTIONS = {
    "news-list": ("news.yml", news),
    "research-cards": ("research.yml", research),
    "pub-list": ("publications.yml", pubs),
    "award-list": ("awards.yml", awards),
    "service-groups": ("service.yml", service),
    "teaching-prose": ("teaching.yml", teaching),
}

text = INDEX.read_text()
for key, (fname, fn) in SECTIONS.items():
    pat = re.compile(rf"(<!-- prerender:{key} -->).*?(<!-- /prerender:{key} -->)", re.S)
    if not pat.search(text):
        sys.exit(f"missing marker for {key} in index.html")
    text = pat.sub(lambda m: m.group(1) + fn(load(fname)) + m.group(2), text)
INDEX.write_text(text)
print("prerendered", ", ".join(SECTIONS))
