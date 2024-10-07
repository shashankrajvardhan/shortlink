const express = require('express');
//const pool = require('./database.cjs');
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
  const { longUrl, name, ogTitle, ogDescription, ogImage } = req.body;
  const userAgent = req.headers['user-agent'];

  if (!longUrl || !name || !ogTitle || !ogDescription) {  
    return res.status(400).json({ error: 'Long URL, name, OG title, and OG description are required' });
  }
  const shortCode = nanoid(8);

  try {
    // const query = 'INSERT INTO urls (name, long_url, short_code, created_by) VALUES ($1, $2, $3, $4) RETURNING *;';
    // const values = [name, longUrl, shortCode, req.user.userId];
    // const result = await pool.query(query, values);
    // const newUrl = result.rows[0];
    const result = await createUrl(name, longUrl, shortCode, req.user ? req.user.userId : null, ogTitle, ogDescription, ogImage, userAgent);
    const newUrl = result;
    res.status(201).json({
      success: true,
      data: {
        name: newUrl.name,
        longUrl: newUrl.long_url,
        shortCode: newUrl.short_code,
        shortUrl: `http://localhost:5000/${newUrl.short_code}`,
        ogTitle: newUrl.og_title,
        ogDescription: newUrl.og_description,
        ogImage: newUrl.og_image
      }
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
});

module.exports = router;
