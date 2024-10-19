
const User = require('../models/User');
const upload = require('../config/uploadConfig');
// Login User
const jwt = require('jsonwebtoken'); 

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // If successful, you can return user details or generate a token here
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Create a new user
// exports.createUser = async (req, res) => {
//     const { departmentId, categoryId, name, age, rate, salary, password, email, roleId } = req.body;

//     try {
//         const newUser = new User({
//             departmentId,
//             categoryId,
//             name,
//             age,
//             rate,
//             salary,
//             password,
//             email,
//             roleId,
//         });

//         await newUser.save();
//         res.status(201).json(newUser);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// };
exports.createUser = async (req, res) => {
    // Use multer to upload the file
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err });
      }
  
      const { departmentId, categoryId, name, age, rate, salary, password, email, roleId } = req.body;
      const userImg = req.file ? req.file.filename : '';  // Store the file name/path if uploaded
  
      try {
        // Create a new user with the provided details and uploaded image
        const newUser = new User({
          departmentId,
          categoryId,
          name,
          age,
          rate,
          salary,
          password,
          email,
          roleId,
          userImg  // Save the uploaded image file name/path here
        });
  
        await newUser.save();  // Save the user in the database
        res.status(201).json(newUser);  // Respond with the created user data
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
      }
    });
  };



// Get all users
exports.getAllUsers = async (req, res) => {
    const { departmentId, categoryId } = req.query; 

    try {
        // Construct the filter
        const filter = {};
        if (departmentId) {
            filter.departmentId = departmentId; 
        }
        if (categoryId) {
            filter.categoryId = categoryId; 
        }

        const users = await User.find(filter).populate('departmentId').populate('categoryId');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('departmentId')  
            .populate('categoryId')  
           

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


// Update a user by ID
// exports.updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { name, age, rate, salary, email, departmentId, categoryId, roleId } = req.body;

//     try {
//         // Find user by ID and update
//         const user = await User.findByIdAndUpdate(
//             id,
//             {
//                 name,
//                 age,
//                 rate,
//                 salary,
//                 email,
//                 departmentId,
//                 categoryId,
//                 roleId,
//             },
//             { new: true, runValidators: true } // options: new returns the updated document, runValidators applies schema validation
//         );

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         res.status(200).json({ message: 'User updated successfully', user });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };
// Update a user by ID
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, age, rate, salary, email, departmentId, categoryId, roleId, profilePicture } = req.body; 

    try {
        // Find user by ID and update
        const user = await User.findByIdAndUpdate(
            id,
            {
                name,
                age,
                rate,
                salary,
                email,
                departmentId,
                categoryId,
                roleId,
                profilePicture, 
            },
            { new: true, runValidators: true } 
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Delete a user by ID
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};