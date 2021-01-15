const mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
    email : {type : String , required : false},
    favourites : [{type : String , required : false}],
    created : {type : Date , default : Date.now()}
});
let User = mongoose.model('user' , UserSchema);
module.exports = User;
