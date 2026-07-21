"""Print compact, review-oriented sections from a local evidence PDF."""

from __future__ import annotations

import re
import sys
from pathlib import Path

from pypdf import PdfReader


def clean(text: str) -> str:
    text = text.replace("\u00ad", "").replace("\u00a0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def excerpt(text: str, patterns: list[str], length: int = 4200) -> str:
    matches = []
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE)
        if match:
            matches.append(match.start())
    if not matches:
        return "SECTION NOT LOCATED"
    start = max(0, min(matches) - 120)
    return text[start : start + length]


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    source = Path(sys.argv[1]).resolve()
    reader = PdfReader(source)
    pages = [clean(page.extract_text() or "") for page in reader.pages]
    full_text = "\n\n".join(pages)
    metadata = reader.metadata or {}

    print("# Document Identity")
    print(f"File: {source.name}")
    print(f"Pages: {len(reader.pages)}")
    print(f"PDF title: {metadata.get('/Title', '')}")
    print(f"PDF author: {metadata.get('/Author', '')}")
    print(f"Extracted characters: {len(full_text)}")
    print("\n# Front Matter")
    print(full_text[:6000])
    print("\n# Methods Excerpt")
    print(excerpt(full_text, [r"^methods?\s*$", r"^materials? and methods?\s*$", r"^methodology\s*$"]))
    print("\n# Results Excerpt")
    print(excerpt(full_text, [r"^results?\s*$", r"^findings?\s*$"]))
    print("\n# Conclusion and Limitations Excerpt")
    print(excerpt(full_text, [r"^conclusions?\s*$", r"^limitations?\s*$", r"^discussion\s*$"], 5600))


if __name__ == "__main__":
    main()
