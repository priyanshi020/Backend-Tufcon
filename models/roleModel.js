const mongoose = require('mongoose');


const roleSchema = mongoose.Schema({
  roleId: {
    type: Number,
    required: true,
  },
  roleName: {
    type: String,
    required: [true, "Role Name is required"],

  }
  ,
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model("role", roleSchema);