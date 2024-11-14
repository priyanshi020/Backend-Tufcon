const attendanceSchema = new mongoose.Schema({
    scannedIn: {
        type: Date,
        default: null,
    },
    scannedOut: {
        type: Date,
        default: null,
    },
    rescan: {
        type: Date,
        default: null,
    },
}, { _id: false });