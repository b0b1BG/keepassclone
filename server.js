'use strict';
const express = require('express');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, 'data');
const KDBX = path.join(DATA, 'vault.kdbx');

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });

app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────────────────
//  The server stores the raw .kdbx file on disk.
//  All decryption/encryption happens in the browser via kdbxweb.
//  The server never sees plaintext — only the encrypted .kdbx bytes.
// ─────────────────────────────────────────────────────────

// GET /api/vault  — download the .kdbx file
app.get('/api/vault', (_req, res) => {
  if (!fs.existsSync(KDBX))
    return res.status(404).json({ error: 'No vault found. Upload your .kdbx file first.' });
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="vault.kdbx"');
  res.send(fs.readFileSync(KDBX));
});

// POST /api/vault  — upload / save the .kdbx file (raw binary body)
app.post('/api/vault', express.raw({ type: '*/*', limit: '32mb' }), (req, res) => {
  if (!req.body || !req.body.length)
    return res.status(400).json({ error: 'Empty body' });
  // Must start with kdbx magic bytes: 03 D9 A2 9A
  const magic = req.body.slice(0, 4);
  if (magic[0] !== 0x03 || magic[1] !== 0xD9 || magic[2] !== 0xA2 || magic[3] !== 0x9A)
    return res.status(400).json({ error: 'Not a valid .kdbx file' });
  fs.writeFileSync(KDBX, req.body);
  res.json({ ok: true, size: req.body.length });
});

// GET /api/vault/exists
app.get('/api/vault/exists', (_req, res) => {
  const exists = fs.existsSync(KDBX);
  res.json({ exists, size: exists ? fs.statSync(KDBX).size : 0 });
});

app.listen(PORT, () =>
  console.log(`WebPass running at http://localhost:${PORT}`));
