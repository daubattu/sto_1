var mongoose = require('mongoose');

var User = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, require: true},
    email: {type: String},
    avatar: {type: String, default: ''},
    birthday: {type: Date, default: Date.now()},
    gender: {type: String, default: ''},
    address: {type: String, default: ''},
    job: {type: String, default: ''}
  }, {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
      }
    }
});

module.exports = mongoose.model('User', User);
