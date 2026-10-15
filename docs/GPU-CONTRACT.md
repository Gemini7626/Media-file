# GPU Cloud HTTP adapter contract

The Cloudflare backend expects a GPU service you operate or subscribe to. This is NOT an existing Civitai/ComfyUI API contract. An adapter is needed to translate checkpoint/version IDs into model files and ComfyUI workflows, subject to model licenses and provider policies.

HTTPS origin in `GPU_API_URL`, Bearer token in `GPU_API_TOKEN`.

POST /v1/jobs
Authorization: Bearer <token>
Content-Type: application/json

Request:
```json
{"prompt":"adult fantasy portrait","checkpoint":{"id":123,"versionId":456},"lora":null,"style":"anime","ratio":"2:3","seed":-1}
```
Response: `{"id":"job_abc","status":"queued"}`.

GET /v1/jobs/job_abc
Response: `{"id":"job_abc","status":"completed","output":["https://example.com/result.png"],"error":null}`.

Statuses: queued, running, completed, failed, canceled. Implement authentication, abuse prevention, per-user limits, spending caps, job ownership checks, safe model loading, license checks, moderation and storage expiry. Never allow untrusted URLs from users to trigger arbitrary model downloads. ComfyUI's native API is NOT directly compatible with this contract. The adapter must map it explicitly.

Important: the current demo backend is not ready for public multi-user generation. Add authentication, quotas, rate limiting, content safeguards, and job ownership verification before enabling GPU_API_URL on a public site.
