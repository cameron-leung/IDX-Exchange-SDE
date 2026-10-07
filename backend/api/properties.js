const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.get('/', async (req, res) => {
  try {
    // Accounting for unknown query parameters
    const allowedParams = new Set([
      'limit',
      'offset',
      'city',
      'zipcode',
      'minPrice',
      'maxPrice',
      'beds',
      'baths',
    ]);
    const unknownParams = Object.keys(req.query).filter((param) => !allowedParams.has(param));
    if (unknownParams.length > 0) {
        return res.status(400).json({
            error: `Unknown query parameters: ${unknownParams.join(', ')}`,
        })
    }
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10)); // Parse limit from query, default to 10 if not provided or invalid, and cap at 100
    const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0)// Calculate the offset for pagination
    
    // Check if database connection parameters are set in .env file
    if (
      !process.env.DB_HOST ||
      !process.env.DB_PORT ||
      !process.env.DB_USER ||
      !process.env.DB_PASSWORD ||
      !process.env.DB_NAME
    ) {
      return res.status(500).json({
        error: 'Database connection is not configured. Add DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME to your .env file.',
      });
    }

    const filters = [];
    const values = [];

    if (req.query.city !== null && typeof req.query.city === 'string') {
        filters.push('L_City = ?');
        values.push(req.query.city);
    }
    if (req.query.zipcode !== null && typeof req.query.zipcode === 'string') {
        filters.push('L_Zip = ?');
        values.push(req.query.zipcode);
    }
    const minPrice = req.query.minPrice;

    if (minPrice !== undefined) {
    const parsedMinPrice = Number(minPrice);

    if (!Number.isNaN(parsedMinPrice) && parsedMinPrice >= 0) {
        filters.push('L_SystemPrice >= ?');
        values.push(parsedMinPrice);
    } else {
        return res.status(400).json({
        error: 'Query parameter minPrice must be a valid non-negative number.',
        });
    }
    }
    const maxPrice = req.query.maxPrice;

    if (maxPrice !== undefined) {
    const parsedMaxPrice = Number(maxPrice);

    if (!Number.isNaN(parsedMaxPrice) && parsedMaxPrice >= 0) {
        filters.push('L_SystemPrice <= ?');
        values.push(parsedMaxPrice);
    } else {
        return res.status(400).json({
        error: 'Query parameter maxPrice must be a valid non-negative number.',
        });
    }
    }

    
    

    if (req.query.beds !== undefined) {
    const parsedBeds = Number(req.query.beds);

    if (Number.isInteger(parsedBeds) && parsedBeds >= 0) {
        filters.push('L_Keyword2 = ?');
        values.push(parsedBeds);
    } else {
        return res.status(400).json({
        error: 'Query parameter beds must be a valid non-negative integer.',
        });
    }
    }

    if (req.query.baths !== undefined) {
    const parsedBaths = Number(req.query.baths);

    if (Number.isInteger(parsedBaths) && parsedBaths >= 0) {
        filters.push('LM_Dec_3 = ?');
        values.push(parsedBaths);
    } else {
        return res.status(400).json({
        error: 'Query parameter baths must be a valid non-negative integer.',
        });
    }
    }

    // Use the filters to construct the parameterized WHERE clause for the SQL query
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM rets_property ${whereClause}`, values);
    
    if (offset >= total) {
        return res.status(400).json({
            error: 'Offset exceeds total number of properties',
            total,
        });
    }

    const [rows] = await db.query(
        `SELECT * FROM rets_property ${whereClause} LIMIT ? OFFSET ?`,
        [...values, limit, offset]
    );
    
    return res.status(200).json({
        total,
      limit,
      offset,
      results: rows,
    });
  } catch (error) {
    console.error('GET /api/properties error:', error);
    return res.status(500).json({
      error: 'Failed to fetch properties',
      details: error.message,
    });
  }
});

module.exports = router;
