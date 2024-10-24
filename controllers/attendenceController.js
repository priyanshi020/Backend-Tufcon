    const User = require('../models/User');
    const axios = require('axios');
    const mongoose = require('mongoose');

    // Azure Face API configuration
    const AZURE_FACE_API_KEY = process.env.AZURE_FACE_API_KEY;
    const AZURE_FACE_API_ENDPOINT = process.env.AZURE_FACE_API_ENDPOINT;

    // Function to convert base64 to binary
    const base64ToBinary = (base64String) => {
        // Remove the "data:image/png;base64," or similar prefix
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const binaryBuffer = Buffer.from(base64Data, 'base64');
        return binaryBuffer;
    };

    // Function to detect and match face with base64 or URL
    const detectAndMatchFace = async (image) => {
        try {
            let response;
    
            // Check if it's base64 or a URL
            if (image.startsWith('data:image')) {
                const binaryImage = base64ToBinary(image); // Convert base64 to binary
                response = await axios({
                    method: 'post',
                    url: `https://tufconfaceinstance.cognitiveservices.azure.com/face/v1.0/detect`,
                    headers: {
                        'Ocp-Apim-Subscription-Key':'5wlejCeK0qaciBRdQMYDg5hZqKzMaliZ3enwuNXXUfeENOS8AgVwJQQJ99AJACGhslBXJ3w3AAAKACOGwL5E',
                        'Content-Type': 'application/octet-stream'
                    },
                    data: binaryImage  // Send binary image data
                });
            } else {
                // Assuming it's a URL
                response = await axios({
                    method: 'post',
                    url: `https://tufconfaceinstance.cognitiveservices.azure.com/face/v1.0/detect`,
                    headers: {
                        'Ocp-Apim-Subscription-Key': '5wlejCeK0qaciBRdQMYDg5hZqKzMaliZ3enwuNXXUfeENOS8AgVwJQQJ99AJACGhslBXJ3w3AAAKACOGwL5E',
                        'Content-Type': 'application/json'
                    },
                    data: { url: image }  // Send URL data
                });
            }
    
            // Check if the response contains data and if faces were detected
            if (response && response.data && response.data.length > 0) {
                return response.data[0].faceId; // Return the first faceId
            } else {
                throw new Error('Face not detected.');
            }
        } catch (err) {
            console.error('Error details:', err.response ? err.response.data : err.message);  // Log more details
            const errorMessage = err.response?.data?.error?.message || 'An unknown error occurred with Azure Face API.';
            throw new Error(`Azure Face API error: ${errorMessage}`);
        }
    };
    
    // Compare the scanned face with the user image
    const compareFaces = async (scannedFaceId, userFaceId) => {
        try {
            const response = await axios({
                method: 'post',
                url: `https://tufconfaceinstance.cognitiveservices.azure.com/face/v1.0/verify`,
                headers: {
                    'Ocp-Apim-Subscription-Key': '5wlejCeK0qaciBRdQMYDg5hZqKzMaliZ3enwuNXXUfeENOS8AgVwJQQJ99AJACGhslBXJ3w3AAAKACOGwL5E',
                    'Content-Type': 'application/json'
                },
                data: {
                    faceId1: scannedFaceId,
                    faceId2: userFaceId
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
            const { scannedImageUrl, action } = req.body; 
        
            if (!scannedImageUrl || !action) {
                return res.status(400).json({ error: 'Scanned image or action missing' });
            }
            console.log('Step 1: Image URL and action received.');
        
            // 1. Detect face from the scanned image
            const scannedFaceId = await detectAndMatchFace(scannedImageUrl);
            console.log('Step 2: Scanned face ID:', scannedFaceId);
        
            if (!scannedFaceId) {
                return res.status(400).json({ error: 'No face detected in the scanned image' });
            }
        
            // 2. Compare scanned face with stored user faces in the database
            const users = await User.find({});
            console.log('Step 3: Users fetched from database.');
        
            let matchedUser = null;
        
            for (let user of users) {
                const storedFaceId = await detectAndMatchFace(user.storedImageUrl); 
                const isMatch = await compareFaces(scannedFaceId, storedFaceId); 
        
                if (isMatch) {
                    matchedUser = user; 
                    console.log('Step 4: Match found:', matchedUser);
                    break; 
                }
            }
        
            if (!matchedUser) {
                return res.status(400).json({ error: 'No matching user found' });
            }
        
            // Proceed to mark attendance based on the action
            console.log('Step 5: Proceeding to mark attendance for:', matchedUser);
            const now = new Date();
            const today = now.toISOString().split('T')[0];  
        
            let attendance = matchedUser.attendance.find(att => att.date === today);
            if (!attendance) {
                attendance = { date: today };
                matchedUser.attendance.push(attendance); 
            }
        
            // Check action and avoid duplicates
            if (action === 'in') {
                if (attendance.scannedIn) {
                    return res.status(400).json({ message: 'User has already scanned in today.' });
                } else {
                    attendance.scannedIn = now;
                    await matchedUser.save();
                    console.log('Step 6: User scanned in successfully.');
                    return res.json({ message: 'User scanned in successfully.' });
                }
            } else if (action === 'out') {
                if (attendance.scannedOut) {
                    return res.status(400).json({ message: 'User has already scanned out today.' });
                } else if (!attendance.scannedIn) {
                    return res.status(400).json({ message: 'User must scan in first.' });
                } else {
                    attendance.scannedOut = now;
                    await matchedUser.save();
                    console.log('Step 7: User scanned out successfully.');
                    return res.json({ message: 'User scanned out successfully.' });
                }
            } else if (action === 'rescan') {
                if (attendance.rescan) {
                    return res.status(400).json({ message: 'User has already rescanned today.' });
                } else {
                    attendance.rescan = now;
                    await matchedUser.save();
                    console.log('Step 8: User rescanned successfully.');
                    return res.json({ message: 'User rescanned successfully.' });
                }
            } else {
                return res.status(400).json({ error: 'Invalid action.' });
            }
        } catch (err) {
            console.error('Error during attendance marking:', err);
            return res.status(500).json({ error: `${err.message}` });
        }
        
    };

    module.exports = { markAttendance };

// const User = require('../models/User');  // Assuming User model is in 'models' folder
// const axios = require('axios');          // To make requests to Azure Face API

// // Azure Face API configuration
// const AZURE_FACE_API_KEY = process.env.AZURE_FACE_API_KEY;  // Make sure this is set in your environment
// const AZURE_FACE_API_ENDPOINT = process.env.AZURE_FACE_API_ENDPOINT;  // Set this as well

// // Function to detect and match face
// const detectAndMatchFace = async (imageUrl) => {
//     try {
//         const response = await axios.post(`${AZURE_FACE_API_ENDPOINT}/detect`, {
//             url: imageUrl
//         }, {
//             headers: {
//                 'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
//                 'Content-Type': 'application/json'
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
//         const response = await axios.post(`${AZURE_FACE_API_ENDPOINT}/verify`, {
//             faceId1: scannedFaceId,
//             faceId2: userFaceId
//         }, {
//             headers: {
//                 'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.isIdentical;  // Returns true if faces match
//     } catch (err) {
//         throw new Error('Azure Face API error: ' + err.message);
//     }
// };

// // Controller to handle attendance
// const markAttendance = async (req, res) => {
//     try {
//         const { scannedImageUrl, action } = req.body; // Scanned image URL and action (in/out/rescan)

//         if (!scannedImageUrl || !action) {
//             return res.status(400).json({ error: 'Scanned image or action missing' });
//         }

//         // Detect face from the scanned image using Azure Face API
//         const scannedFaceId = await detectAndMatchFace(scannedImageUrl);

//         // Compare scanned face with stored user faces in the database (Find the matching user)
//         const users = await User.find({}); // Get all users with their stored images
//         let matchedUser = null;

//         const storedFaceIds = await Promise.all(users.map(user => detectAndMatchFace(user.userImg))); // Get Face IDs for all users

//         for (let i = 0; i < users.length; i++) {
//             const isMatch = await compareFaces(scannedFaceId, storedFaceIds[i]); // Compare scanned face with stored user face
//             if (isMatch) {
//                 matchedUser = users[i]; // Match found
//                 break; // Stop searching after finding the first match
//             }
//         }

//         // If no user matches, return an error
//         if (!matchedUser) {
//             return res.status(400).json({ error: 'No matching user found' });
//         }

//         // Proceed to mark attendance based on the action (in/out/rescan)
//         const now = new Date();
//         const today = now.toISOString().split('T')[0];  // Get date in YYYY-MM-DD format

//         // Find today's attendance or create a new one
//         let attendance = matchedUser.attendance.find(att => att.date === today);
//         if (!attendance) {
//             attendance = { date: today };
//             matchedUser.attendance.push(attendance);  // Add new attendance entry
//         }

//         // Prevent duplicate scans
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
