import express from 'express';
import authenticate from '../server/middleware/authenticate.js';
import Post from '../models/Post';
import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';

let router = express.Router();

router.get('/:id', (req, res) => {
    Post.findById(req.params.id, (err, post) => {
      if(err) res.json(err);
      else res.json(comments);
    })
});

router.post('/', authenticate, (req, res) => {
  let comment = {};

  comment.comment = req.body.comments.comment;
  comment.username = req.body.comments.username || 'Guest';
  comment.date = Date.now();
  comment.user_id = req.decoded._id;

  console.log('comments in post /add/comment', comment);

  Post.findOneAndUpdate({_id: req.body.postId}, {$push: {comments: comment}}, (err, comment) => {
    if(err) res.json(err);
    else res.json(comment);
  })
});

router.put('/:id', authenticate, (req, res) => {

})

router.delete('/:id', authenticate, (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if(err) res.json(err);
    else {
        if(isEmpty(post.comments)) res.json({message: 'Dont have any comments for this post!!!'});
        else {
          let comment = post.comments.filter(comment => comment._id.toString() === req.body.comment_id);
          if(comment.length >= 1) {
            if(comment[0].user_id === req.decoded._id) {
              let newComments = post.comments.filter(cmt => {
                if(cmt._id.toString() !== req.body.comment_id) {
                  return cmt;
                }
              });
              console.log(newComments);
              Post.findOneAndUpdate({_id: req.params.id}, {comments: newComments}, (err) => {
                if(err) res.json(err);
                else res.json({success: true});
              })
            }
            else res.json({message: 'You dont have permission for this action!!!'});
          } else {
            res.json({message: 'Dont find this comment'});
          }
        }
    }
  })
});

export default router;
