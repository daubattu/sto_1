var mongoose = require('mongoose');

var User = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String},
    birthday: {type: String},
    gender: {type: String},
  },{
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret._id;
        delete ret.__v;
      }
    }
});

module.exports = mongoose.model('User', User);
