import express from 'express';
import authenticate from '../server/middleware/authenticate.js';
import User from '../models/user.js';
import Post from '../models/Post';
import isEmpty from 'lodash/isEmpty';
var _ = require('lodash');

let router = express.Router();

router.get('/', authenticate, (req, res) => {
  console.log(req.decoded);
  User.findOne({_id: req.decoded._id}, (err, user) => {
      if(err) res.json(err);
      else res.json(user);
  });
});

router.put('/:id', authenticate, (req, res) => {
  User.findOneAndUpdate({_id: req.params.id}, req.body, (err, user) => {
    if(err) res.json({errors: 'Not found user match with this _id'});
    else if(_.isEqual(user, req.body)) {
      res.json({message: 'You dont change your information!!!'});
    } else res.json({update: 'success', user});
  })
})

router.get('/posts', authenticate, (req, res) => {
  Post.find({'author.user_id': req.decoded._id}, (err, posts) => {
    if(err) res.json(err);
    else res.json(posts);
  })
});

export default router;
