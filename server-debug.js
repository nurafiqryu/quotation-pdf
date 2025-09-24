// server-debug.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MUST be BEFORE routes
app.use(express.json());                // parse application/json
app.use(express.urlencoded({ extended: true })); // parse form bodies if any

// simple health
app.get('/health', (req, res) => res.json({ ok: true }));

// debug route
app.post('/generate-quotation', (req, res) => {
  console.log('----- REQUEST RECEIVED -----');
  console.log('Headers:', req.headers);
  console.log('Content-Type header:', req.headers['content-type']);
  console.log('Raw body (req.body):', req.body);
  // echo back what we received so curl/user sees it
  return res.json({
    success: true,
    message: 'debug echo',
    received: req.body
  });
});

app.listen(PORT, () => console.log(`DEBUG server listening on http://localhost:${PORT}`));
