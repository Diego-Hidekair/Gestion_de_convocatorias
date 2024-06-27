const express = require('express');
const { createPdf } = require('../controllers/pdfController');
const router = express.Router();

router.post('/create', createPdf);

module.exports = router;
