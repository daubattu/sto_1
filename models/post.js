var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: {type: String},
    category: {type: String},
    content: {type: String}
});

module.exports = mongoose.model('Post', postSchema);
