const express = require('express');
const {getUrlByShortCode, logLinkClick} = require('./database.cjs');
const router = express.Router();

router.get('/:shortCode', async (req, res) => {
  try {
    const shortCode = req.params.shortCode;
    const urlRecord = await getUrlByShortCode(shortCode);

    if (!urlRecord){
      return res.status(404).json({message: 'Short URL not found'});
    }
    
    const  longUrl= urlRecord.long_url;
    const  ogTitle= urlRecord.og_title;
    const  ogDescription= urlRecord.og_description || 'This is a sample description.';
    const  ogImage= urlRecord.og_image || 'https://hips.hearstapps.com/digitalspyuk.cdnds.net/12/48/cult_merlin_s05_e09_1.jpg';

    const userAgent = req.header['user-agent'] || 'Unknown';
    const currentDate = new Date();

    await logLinkClick(shortCode, userAgent, currentDate);
    
    const urlData = {
      longUrl,
      ogTitle,
      ogDescription,
      ogImage,
    };

    res.render('redirect', {
      longUrl: urlData.longUrl,
      ogTitle: urlData.ogTitle,
      ogDescription: urlData.ogDescription,
      ogImage: urlData.ogImage
    });

  } catch(error){
    console.error('Error rediractiong:', error);
    res.status(500).json({error: 'Failed to redirect'});
  }
});

module.exports = router;