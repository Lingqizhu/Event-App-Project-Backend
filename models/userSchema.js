const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    userName: String,
    password: String,
    token: String
},
{ collection: 'user-data' }
)

module.exports.User = mongoose.model('User',userSchema)