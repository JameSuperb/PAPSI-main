# PAPSI

This repository contains the static website for PAPSI, including a standalone Training Center at `center.html`.

## Training Center (center.html)

Key features:
- Course listing with search, category/speaker filters, filter chips, and optional stats (clickable year/category).
- Cart with sticky bottom bar, cart modal, voucher validation, and checkout form.
- Confirm Registration posts to Google Apps Script and shows success feedback.
 - Client-side pagination with adjustable page size.

### Endpoints
- Trainings (GET):
	`https://script.google.com/macros/s/AKfycbz8awvt1aQpxA-7vfyp7WJRQLODyHdhVlaMfn7KsRnGIBaLaeQ_7ZYED4qI4kL0CpmXsw/exec?&SH=training&func=training`
- Voucher (GET base):
	`https://script.google.com/macros/s/AKfycbydRAAaO83lKJpCpu7a48YlncAX9R5N1KvRx5LqMofd6Dd-O1S_Mnp9tGysVGFV7q6dZQ/exec`
	- Full URL constructed as: `VOUCHER_URL_BASE?SH=voucher&func=voucher&code=CODE`
- Confirm Registration (POST text/plain):
	`https://script.google.com/macros/s/AKfycbydRAAaO83lKJpCpu7a48YlncAX9R5N1KvRx5LqMofd6Dd-O1S_Mnp9tGysVGFV7q6dZQ/exec?SH=Sheet1&func=cart`

### Data & Storage Keys
- LocalStorage keys are isolated to avoid collisions:
	- `PAPSI_CENTER_CART`
	- `PAPSI_CENTER_VOUCHER`
	- `PAPSI_CENTER_STATS_VISIBLE`
	- `PAPSI_CENTER_CHECKOUT`

## Risk & Compatibility Notes

1) CORS-safe POST to Apps Script
- Use `Content-Type: text/plain` and send the JSON payload as the body string. This avoids preflight and works reliably with Google Apps Script Web Apps.
- Example headers: `{'Content-Type': 'text/plain;charset=utf-8'}`.

2) Totals math contract
- subtotal: sum of regular (non-promo) fees.
- discount: subtotal − sum of promo fees.
- voucherdiscount: percentage discount applied to the promo sum.
- total: promo sum − voucherdiscount.

3) Training payload format
- trainingtext: concatenated course titles, no dates.
- trainingjson: array of objects `[ { title } ]`, no dates.
- nametext: `LASTNAME, FIRSTNAME M` (uppercase, single middle initial without a period).

4) Null-guards and resilience
- Voucher validation accepts either JSON (with `percentage/percent/discount`) or plain text containing a percentage (e.g., `10%`).
- Network errors and unexpected responses show a toast and keep the UI responsive.
- Checkout inputs persist to localStorage; digits-only enforced for Mobile.

5) Compatibility
- The page avoids optional chaining (`?.`) and nullish coalescing (`??`) for broader browser support.
- Visible loading state, failure state, and global error toasts prevent silent “blank screen” issues.

5) Accessibility & UX
- The cart bar hides when the cart modal is open, with a bottom spacer to avoid overlap with content.
- Stats panel visibility is persisted; filter chips include quick-remove actions.

## Local Development

Open `center.html` in a browser. No build step is required; Tailwind is loaded via CDN.

If endpoints change, update constants in `center.html`:
- `TRAININGS_URL`
- `CART_POST_URL`
- `VOUCHER_URL_BASE`
 - Pagination page size: `PAGE_SIZE` (default 9) in `center.html`.

Note: When opening via the `file://` protocol, some browsers restrict network requests. If you run into issues, serve the folder over HTTP (e.g., VS Code Live Server) to test end-to-end.