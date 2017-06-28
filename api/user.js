import express from 'express';
import User from '../models/user.js';
import authenticate from '../server/middleware/authenticate.js';
import isEmpty from 'lodash/isEmpty';
import Post from '../models/Post';
import _ from 'lodash';

let router = express.Router();

router.get('/', authenticate, (req, res) => {
  User.find({}, function(err, users) {
    if(err) throw err;
    else {
      if(isEmpty(users)) res.json({messages: 'No user in db'});
      else res.json(users);
    }
  })
})

router.put('/:id', authenticate, (req, res) => {
  User.findOneAndUpdate({_id: req.params.id}, req.body, (err, user) => {
    if(err) res.status(400).json(err);
    else if(_.isEqual(user, req.body)) {
      res.status(500).json({message: 'You dont change your information!!!'});
    } else res.status(200).json({messages: 'Update success'});
  })
})

router.get('/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if(err) res.status(404).json({errors: err});
    else res.status(200).json(user);
  })
})

router.get('/:id/posts', (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if(err) res.status(404).json(err);
    else {
      Post.find({'author.user_id': req.params.id}, (err, posts) => {
        if(err) res.status(404).json(err);
        else res.status(200).json(posts);
      })
    }
  })
});

export default router;
