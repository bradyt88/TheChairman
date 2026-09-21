# Start The Chairman on GitHub

## 1. Create the repository
Create a **new public repository** called:

`the-chairman`

Do not add a README, .gitignore or licence if GitHub gives you those options. We already have the files.

## 2. Upload this project
Upload the **contents** of the `the-chairman` folder, not the folder itself.

The repository root must look like:

- `index.html`
- `css/`
- `js/`
- `data/`
- `assets/`
- `docs/`
- `.github/`

Do not end up with `the-chairman/index.html` one level too deep.

## 3. Commit
Commit the files to `main`.

## 4. Turn on Pages
Go to:

**Settings → Pages**

Choose the GitHub Actions deployment route. The repository already contains `.github/workflows/pages.yml`.

## 5. Wait for deployment
Open the **Actions** tab and wait for the Pages deployment to finish. Then open the generated Pages URL.

## 6. First test
Confirm these work:

1. The Chairman landing screen loads.
2. `Take control` opens club selection.
3. A club can be selected.
4. Chairman HQ loads.
5. `Advance week` changes the match/news/financial state.
6. Navigation switches between pages.
7. Refreshing the browser keeps the career.
8. Transfer negotiation opens.

## Important
Do not double-click `index.html` for normal testing. The game loads JSON using `fetch()`, so use GitHub Pages or a local web server.

## Approved branding

The landing hero uses the approved master artwork at `assets/branding/chairman-logo-master.png`.

Do not substitute the older concept image or add a second hero-artwork source.