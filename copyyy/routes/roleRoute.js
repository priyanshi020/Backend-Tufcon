const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');


router.post('/createRole', roleController.createRole);


router.get('/getRole', roleController.getRole);


router.post('/updateRole', roleController.updateRole);


router.post('/deleteRole', roleController.deleteRole);

module.exports = router;
