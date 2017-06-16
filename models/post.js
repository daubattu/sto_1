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
      username: {type: String, default: 'Guest'},
      comment: {type: String, default: ''},
    }],
    date: {type: Date, default: Date.now()},
    view: {type: Number, default: 0}
  }, {
    toJSON: {
      transform: function(profile, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.author.user_id;
      }
    }
});

postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);
