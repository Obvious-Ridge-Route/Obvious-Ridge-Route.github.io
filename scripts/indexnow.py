#!/usr/bin/env python3
"""Submit every URL in the live sitemap to IndexNow (Bing, Yandex, Seznam, Naver).

Usage:
  python3 scripts/indexnow.py [--site https://obviousridgeroute.com] [--dry-run]

Reads the key from _config.yml (indexnow_key); the matching key file
(<key>.txt) must already be live at the site root. Standard library only.
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENDPOINT = "https://api.indexnow.org/indexnow"


def read_key():
    with open(os.path.join(ROOT, "_config.yml"), encoding="utf-8") as config:
        match = re.search(r"^indexnow_key:\s*['\"]?([0-9a-f]{8,128})['\"]?\s*$", config.read(), re.MULTILINE)
    if not match:
        sys.exit("indexnow_key is missing from _config.yml")
    return match.group(1)


def sitemap_urls(site):
    with urllib.request.urlopen(f"{site}/sitemap.xml", timeout=30) as response:
        xml = response.read().decode("utf-8")
    return re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)


def main(argv):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--site", default="https://obviousridgeroute.com")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    key = read_key()
    site = args.site.rstrip("/")
    urls = sitemap_urls(site)
    payload = {
        "host": re.sub(r"^https?://", "", site),
        "key": key,
        "keyLocation": f"{site}/{key}.txt",
        "urlList": urls,
    }
    print(f"{len(urls)} URLs from {site}/sitemap.xml")
    if args.dry_run:
        print(json.dumps(payload, indent=2))
        return
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            print(f"IndexNow accepted the URLs (HTTP {response.status})")
    except urllib.error.HTTPError as error:
        sys.exit(f"IndexNow rejected the request: HTTP {error.code} {error.read().decode('utf-8', 'replace')[:300]}")


if __name__ == "__main__":
    main(sys.argv[1:])
