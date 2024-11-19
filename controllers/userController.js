

// Login User
const jwt = require('jsonwebtoken'); 
// Import necessary modules
// Import necessary modules
const User = require("../models/User");
const upload = require("../config/uploadConfig");
const axios = require("axios");
const fs = require("fs");

// Azure Face API configuration
const faceApiEndpoint = "https://tufconfaceinstance.cognitiveservices.azure.com/face/v1.0/detect";
const faceApiKey = "8mQi21OvaQn2jqdebFpRLYewHSBZR4PxOFGNGvk30MxEQWRCYPysJQQJ99AJACGhslBXJ3w3AAAKACOG2Bk1"; // Remember to secure and replace with your key

// Function to get Face ID from the uploaded image
const getFaceIdFromImage = async (imagePath) => {
    console.log('image path',imagePath)
  try {
    const imageData = fs.readFileSync(imagePath); // Read image as binary data
console.log(`imagedaata  and faceapiendpoint ${faceApiEndpoint} and faceapikey ${faceApiKey}`)
    // Send binary data to Azure Face API
    const response = await axios.post(faceApiEndpoint, imageData, {
      headers: {
        "Ocp-Apim-Subscription-Key": faceApiKey,
        "Content-Type": "application/octet-stream",
      },
      params: { 
        // returnFaceId: true, //this is optional for now coz it needs microsoft permission
      },
    });

    return response.data[0]?.faceId || null; // Retrieve faceId if available
  } catch (error) {
    console.error("Error getting Face ID from Azure:", error.message);
    return null;
  }
};

// Controller to create user with face ID
// exports.createUser = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ message: "File upload error", error: err.message });
//     }

//     // Extract user details and file info from request
//     const { departmentId, categoryId, name, age, rate, salary, password, email, roleId, userId } = req.body;
//     const userImg = req.file ? req.file.path : "";  // File path of uploaded image

//     try {
//       // Get Face ID from Azure Face API
//       const faceId = await getFaceIdFromImage(userImg);
//       if (!faceId) {
//         return res.status(400).json({ message: "Unable to detect face in the uploaded image." });
//       }

//       // Create a new user with faceId and other details
//       const newUser = new User({
//         departmentId,
//         categoryId,
//         name,
//         age,
//         rate,
//         salary,
//         password,
//         email,
//         roleId,
//         userImg,
//         userId,
//         faceId, // Store the face ID
//       });

//       await newUser.save(); // Save user data in database

//       // Respond with created user data, including the faceId
//       res.status(201).json(newUser);
//     } catch (err) {
//       console.error("Error in createUser:", err.message);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
// };


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

exports.createUser = async (req, res) => {
    // Use multer to upload the file
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err });
      }
  
      const { departmentId, categoryId, name, age, rate, salary, password, email, roleId,userId } = req.body;
      const userImg = req.file ? req.file.filename : '';  // Store the file name/path if uploaded
  console.log('userImg',userImg)
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
          userImg , // Save the uploaded image file name/path here
          userId
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
    const { name, age, rate, salary, email, departmentId, categoryId, roleId, userImg,userId } = req.body; 

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
                userImg,
                userId 
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