const express = require('express');
const router = express.Router();

let db;

try {
  db = require('../db');
} catch (error) {
  db = null;
}

const getListingId = (req) => req.params.id || req.query.id;

const getOpenHouseByListingId = async (req, res) => {
  const listingId = getListingId(req);

  if (!listingId) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection is not configured' });
    }

    const query = 'SELECT * FROM rets_openhouse WHERE L_ListingID = ?';
    const rows = db.execute
      ? await db.execute(query, [listingId])
      : await db.query(query, [listingId]);

    const results = Array.isArray(rows) ? rows : rows[0] || [];
    return res.json(results);
  } catch (error) {
    console.error('Failed to query rets_openhouse:', error);
    return res.status(500).json({ error: 'Failed to fetch open house records' });
  }
};

router.get('/', getOpenHouseByListingId);
router.get('/:id', getOpenHouseByListingId);

module.exports = router;
