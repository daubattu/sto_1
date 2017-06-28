var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
import _ from 'lodash';

var postSchema = mongoose.Schema({
    title: {type: String, required: true, unique: true},
    author: {
      name: {type: String},
      user_id: {type: String},
      avatar: {type: String, default: ''}
    },
    category: {type: String},
    content: {type: String, require: true},
    thumbnail: {type: String, default: ''},
    comments: [{
      username: {type: String},
      user_id: {type: String},
      comment: {type: String, default: ''},
      date: {type: Date}
    }],
    location : [Number],
    date: {type: Date},
    views: {type: Number, default: 0},
    tags: [String]
  }, {
    toJSON: {
      transform: function(profile, ret) {
        delete ret.__v;
        if(!_.isEmpty(ret.location)) {
          ret.location = {
            longitude: ret.location[0],
            latitude: ret.location[1]
          }
        } else {
          delete ret.location;
        }
      }
    }
});

postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);
