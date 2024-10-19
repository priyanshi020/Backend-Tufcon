const express = require('express');
const { markAttendance } = require('../controllers/attendenceController');

const router = express.Router();

// Route to mark attendance by scanning face
router.post('/attendance/mark', markAttendance);

module.exports = router;
