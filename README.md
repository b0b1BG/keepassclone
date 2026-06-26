# WebPass

A minimal self-hosted cloud password manager with an early-2000s UI.

## How it works

- **All encryption runs in your browser** using the Web Crypto API (AES-256-GCM, PBKDF2-SHA256 with 310,000 iterations).
- The server stores only an **opaque encrypted blob** — it never sees your passwords or master key.
- Single database, single master password.

## Setup

```bash
npm install
node server.js        # runs on http://localhost:3000
```

To run on a different port:
```bash
PORT=8080 node server.js
```

## First use

1. Open `http://your-server:3000`
2. Enter a strong master password
3. Click **New Vault** (first time) or **Unlock** (returning)
4. Add entries, then click **💾 Save** — this encrypts and sends to the server

## API (all data is opaque base64 to the server)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/vault/exists` | Check if a vault is stored |
| GET | `/api/vault/load` | Download the encrypted blob |
| POST | `/api/vault/save` | Upload encrypted blob `{ data: "<base64>" }` |
| DELETE | `/api/vault` | Wipe the vault |

## Data location

The encrypted vault is stored in `./data/vault.enc`.

Back it up however you like — without your master password it's unreadable.

## Security notes

- Put this behind HTTPS (nginx/caddy reverse proxy) in production — never run over plain HTTP on the internet, or your master password is exposed during the unlock request (it never leaves the browser but the encrypted blob goes over the wire).
- The DELETE endpoint has no auth — add your own middleware if needed.
- The master password is never sent to the server. Only the AES-256-GCM ciphertext is.
