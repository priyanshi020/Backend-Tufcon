const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    departmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Department'
    },

    createdAt:Date,
    updateAt:Date
})

module.exports = mongoose.model('Category',categorySchema)