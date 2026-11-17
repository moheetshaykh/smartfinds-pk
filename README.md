# SmartFinds PK

SmartFinds PK is a static, Pakistan-focused product discovery and affiliate website built with HTML, CSS, vanilla JavaScript, and a JSON catalog. It has no backend, checkout, payment processing, inventory, delivery system, build step, or paid API dependency.

## Project structure

```text
smartfindspk/
|-- .gitignore
|-- README.md
|-- app.js
|-- favicon.svg
|-- index.html
|-- products.json
`-- styles.css
```

The site loads `products.json` with a relative URL. Styles, scripts, and the favicon are also referenced relative to `index.html`; category, information, search, product, and comparison routes use relative links and query parameters. This supports both a custom-domain root and GitHub Pages project subpaths.

## Local testing

Run a static HTTP server from the project root (opening `index.html` directly will prevent the browser from fetching the JSON catalog). Python 3 is sufficient:

```powershell
py -m http.server 8000
```

Open <http://localhost:8000>. Stop the server with Ctrl+C. No dependency installation or build command is needed.

## Product data

Edit `products.json` to add or update entries. Each product uses `id`, `name`, `category`, `image`, `description`, `affiliateUrl`, and `demo`. An optional `pricePkr` numeric value is shown as PKR only when verified. Supported categories are `mobile-gadgets`, `electronics`, `home-kitchen`, and `lifestyle`.

Only use genuine retailer/affiliate URLs and verified product information. Set `demo` to `false` only for a verified listing. A retailer link must use HTTP or HTTPS; Buy Now links use `rel="nofollow sponsored noopener"`. Demo products have no Buy Now link. Do not invent prices, discounts, ratings, reviews, availability, or affiliate URLs. The Best Deals route is a catalog browsing view, not a promise of a verified discount.

Product photos and fonts currently load from external hosts. Confirm image usage rights and availability before deployment. The contact form saves a draft in the visitor's browser; it does not send messages.

## Upload to GitHub

Git is initialized locally for this project. No remote repository has been created and no files have been pushed. To publish it yourself:

1. Create a new, empty repository on GitHub. Do not include an additional README, license, or `.gitignore` in the new repository.
2. From this project folder, review the files with `git status --short` and stage/commit them:

	```powershell
	git add .
	git commit -m "Prepare SmartFinds PK for deployment"
	git branch -M main
	```

3. Add the URL of the repository you created and push:

	```powershell
	git remote add origin https://github.com/<USERNAME>/<REPOSITORY>.git
	git push -u origin main
	```

Replace the placeholders with your GitHub username and repository name. Git may ask you to complete its configured GitHub authentication flow; do not put a password or access token in this README or in a Git remote URL.

## Deploy with GitHub Pages

1. Push the project to GitHub using the instructions above.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and `/(root)`, then save.
4. Open the Pages URL shown in the repository settings after deployment completes.

## Deploy with Cloudflare Pages

1. Push the project to GitHub using the instructions above.
2. In Cloudflare, create a **Workers & Pages → Pages** project and connect the GitHub repository.
3. Select **None** as the framework preset. Leave the build command blank and set the build output directory to `.` (the repository root).
4. Start the deployment and use the Pages URL Cloudflare reports after it succeeds.

No deployment has been triggered by this project setup. Cloudflare Pages serves the HTML, CSS, JavaScript, SVG, and JSON files as static assets; there is no server-side runtime requirement.

## Limitations

- The catalog currently contains demo entries without verified prices or affiliate links.
- The contact form does not transmit submissions; there is no contact inbox or backend.
- Product photos and Google Fonts depend on external hosts.
- The privacy text is general information, not legal advice. Review it against actual data practices and applicable requirements before launch.