import express from 'express';
import authenticate from '../server/middleware/authenticate.js';
import Profile from '../models/profile.js';
import User from '../models/user.js';
import Post from '../models/Post';
import isEmpty from 'lodash/isEmpty';
var _ = require('lodash');

let router = express.Router();

router.get('/', authenticate, (req, res) => {
  User.find({username: req.decoded.username}, (err, user) => {
    let userCurrent = Object.assign({}, user);
    if(err) res.json({err});
    else {
      if(isEmpty(user)) res.json({errors: 'Profile not found!!!'});
      else {
        Profile.find({username: req.decoded.username}, (err, profile) => {
          if(err) res.jon({err});
          else {
            if(_.isEqual(profile, [])) {

              let profileUser = new Profile();

              profileUser.username = user[0].username;
              profileUser.birthday = user[0].birthday;
              profileUser.gender = user[0].gender;

              profileUser.save((err, profileSave) => {
                if(err) res.json({errors: 'Save profile failed!!!'});
                else res.json({profileSave, message: 'Save profile ok!!!'})
              })
            } else {
              res.json({message: 'Get not create', profile});
            }
          }
        })
      }
    }
  })
});

router.put('/:id', authenticate, (req, res) => {
  Profile.findOneAndUpdate({_id: req.params.id}, req.body, function (err, profile) {
    if(err) res.json({errors: 'Not found user match with this _id'});
    else if(_.isEqual(profile, req.body)) {
      res.json({message: 'You dont change your information!!!'});
    } else res.json({update: 'success', profile});
  })
})

router.get('/posts', authenticate, (req, res) => {
  Post.find({author: req.decoded.username}, (err, posts) => {
    if(err) res.json({err});
    else {
      res.json({posts});
    }
  })
})

export default router;