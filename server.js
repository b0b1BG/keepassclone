'use strict';
const express = require('express');
const crypto  = require('crypto');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA, 'vault.enc');

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });

app.use(express.json({ limit: '8mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────────────────
//  NOTE: All encryption/decryption happens in the BROWSER.
//  The server only stores and serves the encrypted blob.
//  It never sees plaintext passwords or entry data.
//
//  The blob format is defined by the frontend (WebCrypto):
//    base64( [16-byte PBKDF2 salt] [12-byte AES-GCM IV] [ciphertext+tag] )
//
//  The server treats it as opaque bytes.
// ─────────────────────────────────────────────────────────

// GET /api/vault/exists — does a vault exist?
app.get('/api/vault/exists', (_req, res) => {
  res.json({ exists: fs.existsSync(DB_FILE) });
});

// GET /api/vault/load — send the encrypted blob to the browser
app.get('/api/vault/load', (_req, res) => {
  if (!fs.existsSync(DB_FILE))
    return res.status(404).json({ error: 'No vault found.' });
  const data = fs.readFileSync(DB_FILE, 'utf8').trim();
  res.json({ data });
});

// POST /api/vault/save — receive encrypted blob from browser and store it
//   Body: { data: "<base64 string>" }
app.post('/api/vault/save', (req, res) => {
  const { data } = req.body;
  if (!data || typeof data !== 'string')
    return res.status(400).json({ error: 'data field required' });
  // Basic sanity: must be valid base64
  if (!/^[A-Za-z0-9+/=]+$/.test(data))
    return res.status(400).json({ error: 'invalid data' });
  fs.writeFileSync(DB_FILE, data, 'utf8');
  res.json({ ok: true });
});

// DELETE /api/vault — wipe the stored vault (no auth — add your own if desired)
app.delete('/api/vault', (_req, res) => {
  if (!fs.existsSync(DB_FILE))
    return res.status(404).json({ error: 'no vault' });
  fs.unlinkSync(DB_FILE);
  res.json({ ok: true });
});

app.listen(PORT, () =>
  console.log(`WebPass running at http://localhost:${PORT}`));
