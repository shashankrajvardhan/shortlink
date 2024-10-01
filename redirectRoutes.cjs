const express = require('express');
const {getUrlByShortCode} = require('./database.cjs');
const router = express.Router();

router.get('/:shortCode', async (req, res) => {
  try {
    const shortCode = req.params.shortCode;
    const urlRecord = await getUrlByShortCode(shortCode);

    if (!urlRecord){
      return res.status(404).json({message: 'Short URL not found'});
    }

    res.redirect(urlRecord.long_url);
  } catch(error){
    console.error('Error rediractiong:', error);
    res.status(500).json({error: 'Failed to redirect'});
  }
});

module.exports = router;