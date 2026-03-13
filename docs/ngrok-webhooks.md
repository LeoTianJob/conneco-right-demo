# ngrok setup for Clerk webhooks (local dev)

Clerk sends webhooks from the cloud and cannot reach `http://localhost:3000`. Use ngrok to expose your local app so Clerk can POST to `/api/webhooks/clerk`.

## 1. Install ngrok

- **macOS (Homebrew):** `brew install ngrok`
- **npm (global):** `npm install -g ngrok` or `pnpm add -g ngrok`
- Or download from [ngrok.com](https://ngrok.com/download)

Sign up at [ngrok.com](https://ngrok.com) and run `ngrok config add-authtoken <your-token>` (free tier is enough).

## 2. Start your app and tunnel

**Terminal 1 – Next.js (port 3000):**

```bash
pnpm dev:local
# or: pnpm dev
```

**Terminal 2 – ngrok:**

```bash
ngrok http 3000
```

Or use the project script:

```bash
pnpm tunnel
```

ngrok will print something like:

```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

Copy the **https** URL (e.g. `https://abc123.ngrok-free.app`).

## 3. Configure Clerk webhook

1. Open [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**.
2. Click **Add endpoint**.
3. **Endpoint URL:** `https://<your-ngrok-host>/api/webhooks/clerk`  
   Example: `https://abc123.ngrok-free.app/api/webhooks/clerk`
4. Under **Subscribe to events**, enable:
   - `user.created`
   - `user.updated`
5. Save. Open the new endpoint and copy the **Signing secret** (`whsec_...`).
6. In `.env.local` set:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
   ```
7. Restart your Next.js dev server so it picks up the new secret.

## 4. Test

1. With the app and ngrok running, sign up or sign in with Clerk.
2. Clerk will send a webhook to your ngrok URL → your local app → Supabase `profiles` table.
3. In Supabase Studio (e.g. http://127.0.0.1:54323), check the `profiles` table for the new row.

## Notes

- **Free ngrok:** The hostname (e.g. `abc123.ngrok-free.app`) changes each time you start ngrok. Update the webhook URL in the Clerk Dashboard when it changes.
- **Paid ngrok:** You can use a fixed subdomain so the webhook URL stays the same.
- Keep the ngrok terminal open while developing; closing it stops the tunnel.
