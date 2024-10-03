const express = require('express');
const pool = require('./database.cjs');
const { createUrl } = require('./database.cjs');
let nanoid;
const initializeNanoid = async () => {
  if (!nanoid) {
    const nanoidModule = await import('nanoid');
    nanoid = nanoidModule.nanoid;
  }
};

const router = express.Router();
router.post('/create-url', async (req, res) => {
  await initializeNanoid(); 
  //   if (!req.user) {
  //   return res.status(401).json({ error: 'Unauthorized: No valid user found' });
  // }
  const userId = req.user ? req.user.userId : null;
  const { longUrl, name } = req.body;

  if (!longUrl || !name) {  
    return res.status(400).json({ error: 'Long URL and name are required' });
  }
  const shortCode = nanoid(8);

  try {
    // const query = 'INSERT INTO urls (name, long_url, short_code, created_by) VALUES ($1, $2, $3, $4) RETURNING *;';
    // const values = [name, longUrl, shortCode, req.user.userId];
    // const result = await pool.query(query, values);
    // const newUrl = result.rows[0];
    const result = await createUrl(name, longUrl, shortCode, req.user ? req.user.userId : null);
    const newUrl = result;
    res.status(201).json({
      success: true,
      data: {
        name: newUrl.name,
        longUrl: newUrl.long_url,
        shortCode: newUrl.short_code,
        shortUrl: `http://localhost:5000/${newUrl.short_code}`
      }
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
});

module.exports = router;
