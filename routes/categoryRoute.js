const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/getAllCategories', categoryController.getAllCategories);
// Route to get categories by department ID
router.get('/getCategories/:id', categoryController.getCategoriesByDepartmentId);

// Route to create a new category
router.post('/createCategories', categoryController.createCategory);

// Route to update category by ID
router.post('/updateCategories/:id', categoryController.updateCategory);

// Route to delete category by ID
router.post('/deleteCategories/:id', categoryController.deleteCategory);

module.exports = router;
