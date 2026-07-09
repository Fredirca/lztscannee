# Fortnite Listing Review Tool

GitHub Pages-ready static web app for formatting pasted suspected Fortnite account-sale listings into private evidence reports.

## What it does

- Lets you paste listing text.
- Matches against a rare/OG watchlist.
- Generates a neutral enforcement-style report.
- Saves cases in your browser localStorage.
- Exports saved cases as JSON or CSV.
- Works on GitHub Pages.

## What it does not do

- It does not log into LZT.
- It does not use API keys.
- It does not scrape.
- It does not buy, reserve, message, or interact with accounts.
- It does not run background scans.

GitHub Pages is static hosting, so this app only processes what you paste into it.

## Files

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

## Local use

Open `index.html` in your browser.

## GitHub Pages setup

1. Create a new GitHub repo.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md`.
3. Go to repo **Settings**.
4. Go to **Pages**.
5. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Save.
7. Open the GitHub Pages URL when it finishes deploying.

## Default watchlist

- OG Renegade Raider
- Renegade Raider
- OG Skull Trooper
- Skull Trooper
- Purple Skull
- OG Ghoul Trooper
- Ghoul Trooper
- Pink Ghoul
- OG Aerial Assault
- Aerial Assault Trooper
- Aerial Assault
- OG Raiders Revenge
- Raider's Revenge
- Raiders Revenge
- Raider Revenge

You can edit the list in the app UI, or permanently change it in `app.js`.
