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
    const getSingleQueryValue = (key) => {
      const value = req.query[key];
      if (Array.isArray(value)) {
        return value[0];
      }
      return value;
    };

    // Accounting for known and unknown query parameters
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
      });
    }

    // Validate and parse limit and offset. default to 20 shown properties
    const rawLimit = getSingleQueryValue('limit');
    const parsedLimit = Number.parseInt(rawLimit, 10);

    if (rawLimit !== undefined && rawLimit !== null && String(rawLimit).trim() !== '') {
      if (Number.isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit >= 200) {
        return res.status(400).json({
          error: 'Query parameter limit must be between 1 and 200.',
        });
      }
    }

    const limit = rawLimit !== undefined && rawLimit !== null && String(rawLimit).trim() !== ''
      ? parsedLimit
      : 20; // Parse limit from query, default to 20 if not provided or invalid, and cap at 200
    const offset = Math.max(0, Number.parseInt(getSingleQueryValue('offset'), 10) || 0);
    
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

    // Build the WHERE clause by dynamically pushing conditions and values into arrarys based on the provided query parameters
    const filters = [];
    const values = [];

    const city = getSingleQueryValue('city');
    if (city !== undefined && city !== null && String(city).trim() !== '') {
      const normalizedCity = String(city).trim().toLowerCase();
      filters.push('LOWER(TRIM(L_City)) = LOWER(TRIM(?))');
      values.push(normalizedCity);
    }

    const zipcode = getSingleQueryValue('zipcode');
    if (zipcode !== undefined && zipcode !== null && String(zipcode).trim() !== '') {
      filters.push('L_Zip = ?');
      values.push(String(zipcode).trim());
    }

    const minPrice = getSingleQueryValue('minPrice');
    if (minPrice !== undefined && minPrice !== null && String(minPrice).trim() !== '') {
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

    const maxPrice = getSingleQueryValue('maxPrice');
    if (maxPrice !== undefined && maxPrice !== null && String(maxPrice).trim() !== '') {
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

    const beds = getSingleQueryValue('beds');
    if (beds !== undefined && beds !== null && String(beds).trim() !== '') {
      const parsedBeds = Number(beds);

      if (Number.isInteger(parsedBeds) && parsedBeds >= 0) {
        filters.push('L_Keyword2 = ?');
        values.push(parsedBeds);
      } else {
        return res.status(400).json({
          error: 'Query parameter beds must be a valid non-negative integer.',
        });
      }
    }

    const baths = getSingleQueryValue('baths');
    if (baths !== undefined && baths !== null && String(baths).trim() !== '') {
      const parsedBaths = Number(baths);

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
    // Fetch the properties with the constructed WHERE clause, limit, and offset
    const [rows] = await db.query(
        `SELECT Id, L_Address, L_Zip, L_City, L_Keyword2, LM_Dec_3, L_SystemPrice FROM rets_property ${whereClause} LIMIT ? OFFSET ?`,
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

