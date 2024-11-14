const Category = require('../models/categorySchema');
// Get all categories
const getAllCategories = async (req, res) => {
    const { departmentId } = req.query; // Get departmentId from query parameters

    try {
        // Construct the filter
        const filter = departmentId ? { departmentId } : {}; // If departmentId is provided, filter by it
        
        const categories = await Category.find(filter);
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get categories by department ID
const getCategoriesByDepartmentId = async (req, res) => {
    const { departmentId } = req.query; // Get departmentId from query parameters
    const { id } = req.params; // Get category ID from path parameters

    try {
        // Construct the filter
        const filter = { _id: id };
        if (departmentId) {
            filter.departmentId = departmentId; // Add departmentId to filter if provided
        }

        const category = await Category.findOne(filter);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new category
const createCategory = async (req, res) => {
    const { categoryName, departmentId } = req.body;

    try {
        const newCategory = new Category({
            categoryName,
            departmentId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update category by ID
const updateCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { categoryName, updatedAt: Date.now() }, // Update name and timestamp
            { new: true } // Return the updated document
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(updatedCategory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete category by ID
const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCategoryByName = async (req, res) => {
    try {
        // Check if categoryName is provided in query or body
        const categoryName = req.query.categoryName || req.body.categoryName;

        if (!categoryName) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Find the category by name
        const category = await Category.findOne({ categoryName: categoryName }).populate('departmentId');

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Return the category data
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getAllCategories,
    getCategoriesByDepartmentId,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryByName
};
