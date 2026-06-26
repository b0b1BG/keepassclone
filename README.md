# WebPass v2

A minimal self-hosted web interface for your KeePass `.kdbx` database.

## How it works

- Your `.kdbx` file lives on the server
- **All decryption/encryption happens in your browser** using [kdbxweb](https://github.com/keeweb/kdbxweb)
- The server never sees your master password or plaintext entries
- KeePassXC can open the same file — just don't edit it in both places at once

## Setup

```bash
npm install
node server.js        # → http://localhost:3000
PORT=8080 node server.js   # custom port
```

## First use

1. Open `http://your-server:3000`
2. Drop your `.kdbx` file into the upload zone
3. Enter your master password → click **Unlock**
4. WebPass auto-uploads your `.kdbx` to the server
5. Next time, just enter your password — no upload needed

## Editing

- **Double-click** a row to edit it
- Click **💾 Save to Server** after making changes
- KeePassXC users: re-sync from the server path after WebPass saves

## Production

Put this behind **HTTPS** (nginx/caddy) — never expose over plain HTTP.

```nginx
location / {
    proxy_pass http://localhost:3000;
}
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/vault/exists` | Check if vault is stored |
| GET | `/api/vault` | Download the `.kdbx` file |
| POST | `/api/vault` | Upload/overwrite the `.kdbx` file (raw bytes) |

The server validates the kdbx magic bytes (`03 D9 A2 9A`) on upload.

## Data

Stored at `./data/vault.kdbx`. Back this up — it's your real KeePass file.
