# Poor Boy Rides website

Static site for Poor Boy Rides, a veteran owned Harley-Davidson quick lube and service shop in Burleson, TX. Built by MACC Studios.

- Every push to `main` deploys to Vercel.
- **Preview only:** `vercel.json` sends `X-Robots-Tag: noindex` so Google skips the pitch version. Remove that header at launch.
- Before launch: real prices, hours and owner story (marked `EDIT ME` in `index.html`); make `og:image` a full URL on the real domain; keep the hours in the JSON-LD block in step with the Visit section.
