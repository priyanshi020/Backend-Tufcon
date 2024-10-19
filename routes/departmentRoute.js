const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController')

router.post('/createDepartment', departmentController.createDepartment);


router.get('/getDepartments', departmentController.getDepartments);

router.get('/getByDepartmentId/:id', departmentController.getByDepartmentId);


router.post('/updateDepartment/:id', departmentController.updateDepartment);

router.post('/deleteDepartment/:id', departmentController.deleteDepartment);

module.exports = router;