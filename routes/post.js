import express from 'express';
import Post from '../models/Post';
import authenticate from '../server/middleware/authenticate.js';
import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';

let router = express.Router();

router.post('/', authenticate, (req, res) => {
  let post = new Post();

  post.title = req.body.title;
  post.author.name = req.decoded.username;
  post.author.user_id = req.decoded._id;
  post.category = req.body.category;
  post.content = req.body.content;

  post.save((err, user) => {
    if(err) res.json({errors: err});
    else res.json(post);
  });
});

router.get('/', authenticate, (req, res) => {
  let count;
  let messages = {};

  Post.find().exec({}, (err, posts) => {
    if(posts) count = posts.length;
    if(isEmpty(posts)) messages.err = 'No post in db!!!';
  })
    .then( posts => {
      let page = req.query.page || 1;
      console.log(typeof req.query.page);
      if(req.query.nav) {
        if(req.query.nav == 'next') {
          page++;
        } else if(req.query.nav == 'prev') page--;
      }
      if(req.query.goto) {
        page = req.query.goto;
      }
      if(page <= 0) {
        messages.err = `Err!!! Page dont much fewer than 1!!!`;
      } else if(page > (count/5 + 1)) {
        messages.err = `Err!!! Page dont much more than ${Math.floor(count/5 + 1)}!!!`;
      }

      Post.paginate('find', { page, limit: 5 }, (err, posts) => {
        ! messages.err
        ? res.json(posts.docs)
        : res.json(messages)
      });
    });
});

router.get('/id/:identify', (req, res) => {
  Post.findOne({_id: req.params.identify}, (err, posts) => {
    if(err) res.json(err);
    else {
      if(isEmpty(posts)) res.json({errors: '_id not found!!!'});
      else res.json(posts);
    }
  });
})

router.get('/author/:identify', (req, res) => {
  Post.find({author: req.params.identify}, (err, posts) => {
    if(err) res.json(err);
    else {
      if(isEmpty(posts)) res.json({errors: 'Author not found!!!'});
      else res.json(posts);
    }
  });
})

router.get('/category/:identify', (req, res) => {
  Post.find({category: req.params.identify}, (err, posts) => {
    if(err) res.json(err);
    else {
      if(isEmpty(posts)) res.json({errors: 'Category not found!!!'});
      else res.json(posts);
    }
  });
})

router.put('/:id', authenticate, (req, res) => {
  let messages = {};
  Post.findOne({_id: req.params.id}, (err, post) => {
    if(err) res.json({err: '_id not match any post'});
    else if(isEmpty(post)) messages.err = "No post for this author _id";
  }).then( post => {
    if(post.author.user_id === req.decoded._id) {
      console.log(post.author, req.decoded.username);
      if(!isEmpty(req.body)) {
          function checkUpdate(post, data) {
            if(post.title === data.title
              && post.category === data.category
              && post.content === data.content) return false;
              else return true;
            }
            if(!checkUpdate(post, req.body)) {
              messages.err = 'You need change infor for this action!!!';
              res.json(messages);
            } else {
              Post.findOneAndUpdate({_id: req.params.id}, req.body, (err) => {
                if(err) res.json(err);
                else res.json({update: 'success'})
              })
            }
      } else {
        messages.err = 'You must typing to update!!!'
        res.json(messages);
      }
    } else {
      res.json({err: 'You dont have permission for this action!!!'})
    }
  });
});

router.delete('/:id', authenticate,  (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if(err) res.json(err);
    else {
      console.log(post.author.user_id, req.decoded._id);
      if(post.author.user_id === req.decoded._id) {
        Post.remove({ _id: req.params.id }, (err) => {
          if (err) res.json({errors: 'Not found post with _id like params!!!'})
          else res.json({success: true})
        });
      } else {
        res.json({message: 'You dont have permission for this action!!!'});
      }
    }
  })
})

router.get('/filter/category', (req, res) => {
  Post.find().distinct('category', function(err, categories) {
    if(err) throw err;
    else res.json(categories)
  });
})

router.get('/filter/category/:category', (req, res) => {
  Post.find({category: req.params.category}, function(err, categories) {
    if(err) throw err;
    else {
      isEmpty(categories)
      ? res.json({err: 'Not found!!!'})
      : res.json(categories)
    }
 });
})

export default router;
