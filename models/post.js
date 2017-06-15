var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var postSchema = mongoose.Schema({
    title: {type: String, required: true, unique: true},
    author: {type: String},
    category: {type: String},
    content: {type: String, unique: true},
    comments: [{
      username: {type: String, default: 'Guest'},
      comment: {type: String, default: ''}
    }],
    date: {type: Date, default: Date.now()}
  }, {
    toJSON: {
      transform: function(profile, ret) {
        delete ret._id;
        delete ret.__v;
      }
    }
});

postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);
