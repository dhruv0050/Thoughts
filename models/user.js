const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost:27017/app")

const userSchema = mongoose.Schema({
    username : String,
    name : String,
    email : String,
    age : Number,
    password : String,
    image : String,
    posts : [{type:mongoose.Schema.Types.ObjectId , ref : "post"}]
})

module.exports = mongoose.model('user', userSchema); 