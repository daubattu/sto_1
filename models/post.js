var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var postSchema = mongoose.Schema({
    title: {type: String, required: true, unique: true},
    author: {
      name: {type: String},
      user_id: {type: String}
    },
    category: {type: String},
    content: {type: String, unique: true},
    comments: [{
      username: {type: String},
      user_id: {type: String},
      comment: {type: String, default: ''},
      date: {type: Date}
    }],
    location : [Number],
    date: {type: Date, default: Date.now()},
    view: {type: Number, default: 0},
    tags: [String]
  }, {
    toJSON: {
      transform: function(profile, ret) {
        delete ret.__v;
      }
    }
});

postSchema.index({'location': '2d'});
postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);
