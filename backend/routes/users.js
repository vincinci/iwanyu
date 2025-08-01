const express = require('express');
const router = express.Router();

// TODO: Convert Next.js API routes to Express routes
// Copy logic from src/app/api/users/ routes

router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint - TODO: Implement' });
});

module.exports = router;
