
// const User = require('../models/User');  // Assuming User model is in 'models' folder
// const axios = require('axios');          // To make requests to Azure Face API
// const mongoose = require('mongoose');

// // Azure Face API configuration
// const AZURE_FACE_API_KEY = process.env.AZURE_FACE_API_KEY;  // Make sure this is set in your environment
// const AZURE_FACE_API_ENDPOINT = process.env.AZURE_FACE_API_ENDPOINT;  // Set this as well

// // Function to detect and match face
// const detectAndMatchFace = async (imageUrl) => {
//     try {
//         const response = await axios({
//             method: 'post',
//             url: `${AZURE_FACE_API_ENDPOINT}/detect`,
//             headers: {
//                 'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
//                 'Content-Type': 'application/json'
//             },
//             data: {
//                 url: imageUrl
//             }
//         });

//         // Extract faceId from the response
//         if (response.data && response.data.length > 0) {
//             return response.data[0].faceId;
//         } else {
//             throw new Error('Face not detected.');
//         }
//     } catch (err) {
//         throw new Error('Azure Face API error: ' + err.message);
//     }
// };

// // Compare the scanned face with the user image
// const compareFaces = async (scannedFaceId, userFaceId) => {
//     try {
//         const response = await axios({
//             method: 'post',
//             url: `${AZURE_FACE_API_ENDPOINT}/verify`,
//             headers: {
//                 'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
//                 'Content-Type': 'application/json'
//             },
//             data: {
//                 faceId1: scannedFaceId,
//                 faceId2: userFaceId
//             }
//         });

//         return response.data.isIdentical;  // Returns true if faces match
//     } catch (err) {
//         throw new Error('Azure Face API error: ' + err.message);
//     }
// };

// // Controller to handle attendance
// // const markAttendance = async (req, res) => {
// //     try {
// //         const { userId } = req.params; // Get userId from request params
// //         const { scannedImageUrl } = req.body; // Image URL from scanned face

// //         // Find the user from the database
// //         const user = await User.findById(userId);
// //         if (!user) return res.status(404).json({ error: 'User not found' });

// //         // Get user image URL (stored during registration)
// //         const userImageUrl = user.userImg;

// //         // Detect and get Face IDs for both the scanned image and user's stored image
// //         const scannedFaceId = await detectAndMatchFace(scannedImageUrl);
// //         const userFaceId = await detectAndMatchFace(userImageUrl);

// //         // Compare both faces
// //         const isMatch = await compareFaces(scannedFaceId, userFaceId);

// //         if (isMatch) {
// //             // Update attendance status (e.g., scannedIn, scannedOut, rescan)
// //             const now = new Date();
// //             const attendance = user.attendance[0];  // Assuming first record in attendance array

// //             if (!attendance.scannedIn) {
// //                 attendance.scannedIn = now;
// //                 await user.save();
// //                 return res.json({ message: 'User scanned in successfully.' });
// //             } else if (!attendance.scannedOut) {
// //                 attendance.scannedOut = now;
// //                 await user.save();
// //                 return res.json({ message: 'User scanned out successfully.' });
// //             } else {
// //                 attendance.rescan = now;
// //                 await user.save();
// //                 return res.json({ message: 'User rescanned successfully.' });
// //             }
// //         } else {
// //             return res.status(400).json({ error: 'Face does not match' });
// //         }
// //     } catch (err) {
// //         return res.status(500).json({ error: err.message });
// //     }
// // };

// const markAttendance = async (req, res) => {
//     try {
//         const { scannedImageUrl, action } = req.body; // Scanned image URL and action (in/out/rescan)

//         if (!scannedImageUrl || !action) {
//             return res.status(400).json({ error: 'Scanned image or action missing' });
//         }

//         // 1. Detect face from the scanned image using Azure Face API
//         const scannedFaceId = await detectAndMatchFace(scannedImageUrl);  // Azure Face API returns Face ID for scanned image

//         if (!scannedFaceId) {
//             return res.status(400).json({ error: 'No face detected in the scanned image' });
//         }

//         // 2. Compare scanned face with stored user faces in the database (Find the matching user)
//         const users = await User.find({}); // Get all users with their stored images
//         let matchedUser = null;

//         for (let user of users) {
//             const storedFaceId = await detectAndMatchFace(user.userImg); // Get Face ID of stored image for each user
//             const isMatch = await compareFaces(scannedFaceId, storedFaceId); // Compare scanned face with stored user face

//             if (isMatch) {
//                 matchedUser = user; // Match found
//                 break; // Stop searching after finding the first match
//             }
//         }

//         // 3. If no user matches, return an error
//         if (!matchedUser) {
//             return res.status(400).json({ error: 'No matching user found' });
//         }

//         // 4. Proceed to mark attendance based on the action (in/out/rescan)
//         const now = new Date();
//         const today = now.toISOString().split('T')[0];  // Get date in YYYY-MM-DD format

//         // Find today's attendance or create a new one
//         let attendance = matchedUser.attendance.find(att => att.date === today);
//         if (!attendance) {
//             attendance = { date: today };
//             matchedUser.attendance.push(attendance);  // Add new attendance entry
//         }

//         // 5. Prevent duplicate scans
//         if (action === 'in') {
//             if (attendance.scannedIn) {
//                 return res.status(400).json({ message: 'User has already scanned in today.' });
//             } else {
//                 attendance.scannedIn = now; // Record scan-in time
//                 await matchedUser.save();
//                 return res.json({ message: 'User scanned in successfully.' });
//             }
//         } else if (action === 'out') {
//             if (attendance.scannedOut) {
//                 return res.status(400).json({ message: 'User has already scanned out today.' });
//             } else if (!attendance.scannedIn) {
//                 return res.status(400).json({ message: 'User must scan in first.' });
//             } else {
//                 attendance.scannedOut = now; // Record scan-out time
//                 await matchedUser.save();
//                 return res.json({ message: 'User scanned out successfully.' });
//             }
//         } else if (action === 'rescan') {
//             if (attendance.rescan) {
//                 return res.status(400).json({ message: 'User has already rescanned today.' });
//             } else {
//                 attendance.rescan = now; // Record rescan time
//                 await matchedUser.save();
//                 return res.json({ message: 'User rescanned successfully.' });
//             }
//         } else {
//             return res.status(400).json({ error: 'Invalid action.' });
//         }
//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// };





// module.exports = { markAttendance };



const User = require('../models/User');  // Assuming User model is in 'models' folder
const axios = require('axios');          // To make requests to Azure Face API

// Azure Face API configuration
const AZURE_FACE_API_KEY = process.env.AZURE_FACE_API_KEY;  // Make sure this is set in your environment
const AZURE_FACE_API_ENDPOINT = process.env.AZURE_FACE_API_ENDPOINT;  // Set this as well

// Function to detect and match face
const detectAndMatchFace = async (imageUrl) => {
    try {
        const response = await axios.post(`${AZURE_FACE_API_ENDPOINT}/detect`, {
            url: imageUrl
        }, {
            headers: {
                'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        // Extract faceId from the response
        if (response.data && response.data.length > 0) {
            return response.data[0].faceId;
        } else {
            throw new Error('Face not detected.');
        }
    } catch (err) {
        throw new Error('Azure Face API error: ' + err.message);
    }
};

// Compare the scanned face with the user image
const compareFaces = async (scannedFaceId, userFaceId) => {
    try {
        const response = await axios.post(`${AZURE_FACE_API_ENDPOINT}/verify`, {
            faceId1: scannedFaceId,
            faceId2: userFaceId
        }, {
            headers: {
                'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        return response.data.isIdentical;  // Returns true if faces match
    } catch (err) {
        throw new Error('Azure Face API error: ' + err.message);
    }
};

// Controller to handle attendance
const markAttendance = async (req, res) => {
    try {
        const { scannedImageUrl, action } = req.body; // Scanned image URL and action (in/out/rescan)

        if (!scannedImageUrl || !action) {
            return res.status(400).json({ error: 'Scanned image or action missing' });
        }

        // Detect face from the scanned image using Azure Face API
        const scannedFaceId = await detectAndMatchFace(scannedImageUrl);

        // Compare scanned face with stored user faces in the database (Find the matching user)
        const users = await User.find({}); // Get all users with their stored images
        let matchedUser = null;

        for (let user of users) {
            const storedFaceId = await detectAndMatchFace(user.userImg); // Get Face ID of stored image for each user
            const isMatch = await compareFaces(scannedFaceId, storedFaceId); // Compare scanned face with stored user face

            if (isMatch) {
                matchedUser = user; // Match found
                break; // Stop searching after finding the first match
            }
        }

        // If no user matches, return an error
        if (!matchedUser) {
            return res.status(400).json({ error: 'No matching user found' });
        }

        // Proceed to mark attendance based on the action (in/out/rescan)
        const now = new Date();
        const today = now.toISOString().split('T')[0];  // Get date in YYYY-MM-DD format

        // Find today's attendance or create a new one
        let attendance = matchedUser.attendance.find(att => att.date === today);
        if (!attendance) {
            attendance = { date: today };
            matchedUser.attendance.push(attendance);  // Add new attendance entry
        }

        // Prevent duplicate scans
        if (action === 'in') {
            if (attendance.scannedIn) {
                return res.status(400).json({ message: 'User has already scanned in today.' });
            } else {
                attendance.scannedIn = now; // Record scan-in time
                await matchedUser.save();
                return res.json({ message: 'User scanned in successfully.' });
            }
        } else if (action === 'out') {
            if (attendance.scannedOut) {
                return res.status(400).json({ message: 'User has already scanned out today.' });
            } else if (!attendance.scannedIn) {
                return res.status(400).json({ message: 'User must scan in first.' });
            } else {
                attendance.scannedOut = now; // Record scan-out time
                await matchedUser.save();
                return res.json({ message: 'User scanned out successfully.' });
            }
        } else if (action === 'rescan') {
            if (attendance.rescan) {
                return res.status(400).json({ message: 'User has already rescanned today.' });
            } else {
                attendance.rescan = now; // Record rescan time
                await matchedUser.save();
                return res.json({ message: 'User rescanned successfully.' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid action.' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { markAttendance };
