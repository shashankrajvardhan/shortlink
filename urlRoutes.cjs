const express = require('express');
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
//  const userId = req.user ? req.user.userId : null;
  const { longUrl, name, mobileUrl, desktopUrl, ogTitle, ogDescription, ogImage } = req.body;
  const userAgent = req.headers['user-agent'];
  const mobileUrlToSave = mobileUrl || longUrl;
  const desktopUrlToSave = desktopUrl || longUrl;

  if (!longUrl || !name || !ogTitle || !ogDescription) {  
    return res.status(400).json({ error: 'Long URL, name, OG title, and OG description are required' });
  }
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    // const query = 'INSERT INTO urls (name, long_url, short_code, created_by) VALUES ($1, $2, $3, $4) RETURNING *;';
    // const values = [name, longUrl, shortCode, req.user.userId];
    // const result = await pool.query(query, values);
    // const newUrl = result.rows[0];
    const shortCode = nanoid(6);
    
    const result = await createUrl(name, mobileUrlToSave, desktopUrlToSave, longUrl, shortCode, null, ogTitle, ogDescription, ogImage, userAgent);
    res.status(201).json({
      success: true,
      data: {
        name: result.name,
        shortCode: result.short_code,
        shortUrl: `http://localhost:5000/${shortCode}`,
        mobileUrl: result.mobile_url,
        desktopUrl: result.desktop_url,
        ogTitle: result.og_title,
        ogDescription: result.og_description,
        ogImage: result.og_image
      }
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
});

module.exports = router;
