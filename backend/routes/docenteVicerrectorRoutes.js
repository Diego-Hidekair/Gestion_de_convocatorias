const express = require('express');
const router = express.Router();
const { getDocentes, getVicerrectores } = require('../controllers/docenteVicerrectorController');

// Rutas públicas o protegidas, según lo desees
router.get('/docentes', getDocentes);
router.get('/vicerrectores', getVicerrectores);

module.exports = router;
