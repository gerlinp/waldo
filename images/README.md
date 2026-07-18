# Puzzle images

Drop your scene images here (e.g. `images/my-scene.jpg`) plus a smaller
thumbnail (e.g. `images/my-scene-thumb.jpg`), then add a matching entry to
`puzzles.json` at the project root.

## Extracting pages from a PDF book

If you're scanning pages out of a Where's Waldo book PDF, `pdftoppm`
(from `poppler-utils`) is the easiest way to turn a page into a JPG:

```sh
# install if needed: sudo pacman -S poppler   (Arch)
pdftoppm -jpeg -r 200 -f 12 -l 12 book.pdf images/my-scene
```

- `-f 12 -l 12` — extract just page 12 (first/last page number).
- `-r 200` — render at 200 DPI; raise it for a crisper, more zoomable image.
- Output lands as `images/my-scene-12.jpg` — rename it to match the `image`
  path you use in `puzzles.json`.

Make a thumbnail (small enough to load fast in the puzzle grid) with
ImageMagick:

```sh
convert images/my-scene.jpg -resize 400x images/my-scene-thumb.jpg
```

## Finding target coordinates

Open `tools/coord-finder.html` in the browser, load your image, click
directly on Waldo, and copy the generated JSON snippet into
`puzzles.json`.
