var mongoose = require('mongoose');

var User = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String},
    birthday: {type: String},
    gender: {type: String}
});

module.exports = mongoose.model('User', User);
