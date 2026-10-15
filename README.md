# Media Studio AI v4 — Civitai + GPU Cloud

## Working now
- Responsive Vietnamese website (Anime/Realistic UI)
- Civitai checkpoint/LoRA search via Pages Function (`/api/models`), including optional mature metadata when supported by Civitai and applicable policies
- Save model/version IDs to browser localStorage; select checkpoint and optional LoRA
- GPU adapter submission and polling **only when a compatible GPU endpoint has been provisioned**
- Local browser job list, results links, JSON export
- Backend health check, API key stays server-side

## Not implemented / limitations
- No free GPU is included. No model weights are hosted. Civitai search is not image generation.
- No built-in ComfyUI deployment; `docs/GPU-CONTRACT.md` defines an adapter contract to implement for a specific GPU provider.
- No authentication, per-user quotas, server-side history, moderation or persistent cloud storage. **Do not expose a funded GPU endpoint publicly before adding these.**
- Browser history is device-specific; provider output links may expire.
- Civitai API availability, NSFW visibility and usage permissions depend on their policies and the user's region.

## Local run (Windows VS Code)
1. Install Node.js LTS and open this project folder in VS Code.
2. Run `npx wrangler pages dev public` in terminal. Open the URL printed (typically http://localhost:8788).
3. Search Civitai models; save checkpoint/LoRA. This does not require a GPU key for public search (subject to Civitai access).
4. For actual generation, provision a GPU service and an adapter implementing `docs/GPU-CONTRACT.md`. Copy `.dev.vars.example` to `.dev.vars` and fill secrets, then restart dev server. NEVER commit `.dev.vars`.

## Deploy Cloudflare Pages
1. `npx wrangler login`
2. In Cloudflare dashboard, create a Pages project with Direct Upload named `mediastudio-ai-06` (or another available name).
3. From project root: `npx wrangler pages deploy public --project-name mediastudio-ai-06`.
4. Open the real `*.pages.dev` URL shown in Wrangler, check `/api/health` and `/api/models?query=anime`.
5. If using a GPU service, configure encrypted production secrets in Dashboard > Workers & Pages > your project > Settings > Variables and Secrets (GPU_API_URL may be a non-secret variable; GPU_API_TOKEN MUST be encrypted). Redeploy after configuration if necessary.
6. The site can run without your PC, but image generation only works when your GPU service is online.

## Safety and security
- For private testing only until login, server-side quotas, rate limiting, spending caps, model-license checks and content controls are implemented.
- Do not share API tokens or place them in HTML/JS.
- Only generate lawful adult content with consent; never minors or non-consensual intimate imagery.
- Do not assume a Civitai model is permitted for commercial use or supported by a given cloud provider.

## References
https://github.com/civitai/civitai-developer-docs/blob/main/site/reference/models.md
https://developers.cloudflare.com/pages/functions/get-started/
https://developers.cloudflare.com/workers/wrangler/commands/pages/
