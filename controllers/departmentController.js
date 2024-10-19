const Department = require('../models/departmentModel'); // Adjust the path as necessary

// Create a new department
exports.createDepartment = async (req, res) => {
    const { departmentName } = req.body;

    try {
        const newDepartment = new Department({
            departmentName,
            createdAt: new Date(),
            updateAt: new Date(),
        });

        const savedDepartment = await newDepartment.save();
        res.status(201).json(savedDepartment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all departments
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single department by ID
exports.getByDepartmentId = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json(department);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a department by ID
 exports.updateDepartment = async (req, res) => {
    try {
        const { departmentName } = req.body; // Get the updated department name from the request body
        const updatedDepartment = await Department.findByIdAndUpdate(
            req.params.id,
            { departmentName, updatedAt: Date.now() }, // Update the name and timestamp
            { new: true } // Return the updated document
        );

        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json(updatedDepartment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a department by ID
exports.deleteDepartment = async (req, res) => {
    try {
        const deletedDepartment = await Department.findByIdAndDelete(req.params.id);

        if (!deletedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

