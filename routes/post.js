import express from 'express';
import Post from '../models/Post';
import authenticate from '../server/middleware/authenticate.js';

let router = express.Router();

router.post('/', authenticate, (req, res) => {
  let post = new Post();

  post.title = req.body.title;
  post.author = req.decoded.username;
  post.category = req.body.category;
  post.content = req.body.content;

  post.save((err, user) => {
    if(err) res.json({errors: err});
    else res.json({post});
  });
});

router.get('/', authenticate, (req, res) => {
  Post.find(null, (err, posts) => {
    res.json({posts})
  })
});

router.get('/:author', (req, res) => {
  Post.find({author: req.params.author}, (err, posts) => {
    if(posts === []) res.json({errors: 'Author not found!!!'});
    else res.json({posts});
  })
})

router.delete('/:id', (req, res) => {
  Post.remove({ _id: req.params.id }, (err) => {
    if (err) res.json({errors: 'Not found post with _id like params!!!'})
    else res.json({success: true})
});
})

export default router;
