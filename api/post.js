import express from 'express';
import Post from '../models/Post';
import authenticate from '../server/middleware/authenticate.js';
import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';
import axios from 'axios';

let router = express.Router();

router.get('/', (req, res) => {
  let count;
  let messages = {};

  let posts = [];

  if(!_.isEmpty(req.query.latitude) && !_.isEmpty(req.query.longitude)) {
    console.log('111111111111111111111111111111');
    let coords = []

    coords[1] = req.query.latitude;
    coords[0] = req.query.longitude;

    let maxDistance = req.query.distance || 5000;
    maxDistance /= 6371;

    var pageOptions = {
      page: req.query.page || 0,
      limit: req.query.limit || 5
    }

    if(req.query.nav) {
      if(req.query.nav == 'next') {
        pageOptions.page++;
      } else if(req.query.nav == 'prev') pageOptions.page--;
    }
    if(req.query.goto) {
      pageOptions.page = req.query.goto;
    }
    if(pageOptions.page < 0) {
      messages.err = `Err!!! Page dont much fewer than 1!!!`;
    } else if(pageOptions.page > (count/5 + 1)) {
      messages.err = `Err!!! Page dont much more than ${Math.floor(count/5 + 1)}!!!`;
    }

    Post.find({
      location: {
        $near: coords,
        $maxDistance: maxDistance
      }
    }).skip(pageOptions.page*pageOptions.limit)
      .sort({date: -1})
      .limit(pageOptions.limit)
      .exec(function (err, posts) {
          if(err) res.status(500).json(err);
          else {
            posts = posts.filter(post => {
              if(!_.isEmpty(post.location)) {
                return post;
              }
            })
            res.status(200).json(posts);
          }
      })
  } else {
    console.log("22222222222222222222");
    Post.find().exec({}, (err, posts) => {
      if(posts) count = posts.length;
      else if(isEmpty(posts)) res.status(404).json({err: 'No post in db!!!'});
    })
    .then( posts => {

      var pageOptions = {
        page: req.query.page || 0,
        limit: req.query.limit || 5
      }

      if(req.query.nav) {
        if(req.query.nav == 'next') {
          pageOptions.page++;
        } else if(req.query.nav == 'prev') pageOptions.page--;
      }
      if(req.query.goto) {
        pageOptions.page = req.query.goto;
      }
      if(pageOptions.page < 0) {
        messages.err = `Err!!! Page dont much fewer than 1!!!`;
      } else if(pageOptions.page > (count/5 + 1)) {
        messages.err = `Err!!! Page dont much more than ${Math.floor(count/5 + 1)}!!!`;
      }

      let maxPage;

      Post.find({}, (err, posts) => {
        if(!err) maxPage = posts.length;
      }).then(posts => {
        Post.find({})
        .skip(pageOptions.page*pageOptions.limit)
        .sort({date: -1})
        .limit(pageOptions.limit)
        .exec(function (err, posts) {
          if(err) res.status(500).json(err);
          else {
            res.status(200).json({posts, maxPage});
          }
        })
      });
    });
  }
});

router.get('/controversial', (req, res) => {
  Post.aggregate([
  {
    $project : { commentsCount: {$size: { "$ifNull": [ "$comments", [] ] } },
     title: "$title", date: "$date", author: "$author", category: "$category",
     content: "$content", thumbnail: "$thumbnail", comments: "$comments", location: "$location", views: "$views", tags: "$tags"
    }
  },
  {$sort: {"commentsCount": -1}}
  ]).exec((err, posts) => {
    if(!err) {
      posts = posts.filter(post => {
        let time = new Date() - new Date(post.date);
        if(post.commentsCount !== 0 && time < 86400000) return post;
      })
      res.json({posts, maxPage: posts.length});
    }
  })
});

router.get('/top', (req, res) => {
  Post.find({views: {$gt: 0}}).sort({views: -1}).limit(5).exec((err, posts) => {
    if(!err) {
      posts = posts.filter(post => {
        let time = new Date() - new Date(post.date);
        if(post.commentsCount !== 0 && time < 86400000) return post;
      })
      res.json({posts, maxPage: posts.length});
    }
  })
});

router.get('/topMonth', (req, res) => {
  Post.find({views: {$gt: 0}}).sort({views: -1}).limit(5).exec((err, posts) => {
    if(!err) {
      posts = posts.filter(post => {
        let time = new Date() - new Date(post.date);
        if(post.commentsCount !== 0 && time < 86400000) return post;
      })
      res.json({posts, maxPage: posts.length});
    }
  })
});

router.post('/', authenticate, (req, res) => {
  let post = new Post();

  console.log(req.body.longitude, req.body.latitude);
  if(!_.isEmpty(req.body.longitude) && !_.isEmpty(req.body.latitude)) {
    post.location.push(req.body.longitude);
    post.location.push(req.body.latitude);
  }

  post.title = req.body.title;
  post.author.name = req.decoded.username;
  post.date = req.body.date;
  post.author.user_id = req.decoded._id;
  post.category = req.body.category;
  if(req.body.thumbnail) {
    post.thumbnail = req.body.thumbnail;
  }
  if(req.body.tags) {
    post.tags = req.body.tags.split(',')
  }
  post.content = req.body.content;

  post.save((err, user) => {
    if(err) res.status(404).json(err);
    else res.status(200).json(post);
  });
});

router.get('/:id', (req, res) => {
  Post.findById(req.params.id, (err, posts) => {
    if(err) res.status(404).json(err);
    else {
      if(isEmpty(posts)) res.status(404).json({errors: '_id not found!!!'});
      else res.status(200).json(posts);
    }
  })
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

router.get('/:id/comments', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if(err) res.status(404).json(err);
    else res.status(200).json(post.comments);
  });
});

router.post('/:id/comments', authenticate, (req, res) => {

  let comment = {};

  comment.comment = req.body.comment;
  comment.username = req.body.username || req.decoded.username || 'Guest';
  comment.date = Date.now();
  comment.user_id = req.decoded._id;

  console.log(req.decoded._id);

  Post.findById(req.params.id, (err, post) => {
    if(err) res.status(404).json(err);
    else {
      let isExist = false;
      for(let cmt of post.comments) {
        if(cmt.user_id === req.decoded._id && cmt.comment === comment.comment) {
          isExist = true;
        }
      }
      if(isExist) {
        let errors = {};
        errors.deprecated = 'You already post this comment. Try with another comment!!!';
        res.status(400).json({errors});
      }
      else {
        Post.findOneAndUpdate({_id: req.params.id}, {$push: {comments: comment}}, (err, comment) => {
          if(err) res.status(400).json(err);
          else res.status(200).json(comment);
        });
      }
    }
  })

});

router.put('/:id/comments', authenticate, (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if(err) res.status(404).json(err);
    else {
      let pos = -1;
      for(let i = 0; i < post.comments.length; i++) {
        if(post.comments[i]._id.toString() === req.body.comment_id) {
          pos = i;
          break;
        }
      }
      console.log(pos);
      if(pos === -1) {
        res.status(404).json({message: 'not found _id comment'});
      } else {
        console.log(post.comments[pos].user_id, req.decoded._id);
        if(post.comments[pos].user_id !== req.decoded._id) {
          res.status(403).json({message: 'You dont have permission for this action'});
        } else {
          if(post.comments[pos].comment === req.body.comment_content) {
            res.status(400).json({message: 'You need typing for this action'});
          } else {
            post.comments[pos].comment = req.body.comment_content;
            post.save();
            res.json(post.comments);
          }
        }
      }
    }
  });
})

router.delete('/:id/comments', authenticate, (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if(err) res.status(400).json(err);
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
        else res.status(401).json({message: 'You dont have permission for this action!!!'});
      } else {
        res.status(404).json({message: 'Dont find this comment'});
      }
    }
  });
});

router.get('/:id/tags', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if(err) res.status(404).json(err);
    else res.status(200).json(post.tags);
  })
});

router.post('/:id/tags', (req, res) => {
  if(!_.isEmpty(req.body.tags)) {
    let tags = req.body.tags.split(',').map(tag => {
      return _.trimStart(tag);
    });
    console.log(tags);
    Post.findById(req.params.id, (err, post) => {
      if(err) res.status(404);
      else {
        let message = [];
        for(let tag of tags) {
          if(!post.tags.includes(tag)) post.tags.push(tag);
          else message.push(`${tag} is exist!!!`)
        }
        post.save();
        if(_.isEmpty(message)) {
          res.status(200).json(post.tags);
        } else {
          res.status(400).json(message);
        }
      }
    });
  } else {
    res.status(400).json({message: 'You need typing some thing for this action'})
  }
})

router.put('/:id/tags', authenticate, (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if(err) res.status(404);
    else {
      if(req.decoded.username === 'admin') {
        let pos = -1;
        for(let i in post.tags) {
          if(post.tags[i] === req.body.tag) pos = i;
        }
        console.log(pos);
        if(pos === -1) {
          res.status(404).json({message: 'req.body.tag is not found'});
        } else {
          if(post.tags[pos] === req.body.tag_content) res.status(400).json({message: 'You dont change anything!!!'})
          else {
            post.tags[pos] = req.body.tag_content;
            let tags = post.tags;
            Post.findOneAndUpdate({_id: req.params.id}, {tags}, (err, post) => {
              if(err) res.status(404).json(err);
              else res.status(200).json(post.tags)
            });
          }
        }
      } else {
        res.status(403).json({message: 'You dont have permission for this action'});
      }
    }
  });
});

router.delete('/:id/tags', authenticate, (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if(err) res.status(404);
    else {
      if(req.decoded.username === 'admin') {
        let pos = -1;
        for(let i in post.tags) {
          if(post.tags[i] === req.body.tag) pos = i;
        }
        console.log(pos);
        if(pos === -1) {
          res.status(404).json({message: 'req.body.tag is not found'});
        } else {
          let tags = post.tags.filter(tag => {
            return tag !== req.body.tag;
          });
          Post.findOneAndUpdate({_id: req.params.id}, {tags}, (err, post) => {
            if(err) res.status(404).json(err);
            else res.status(200).json(post.tags)
          });
        }
      } else {
        res.status(403).json({message: 'You dont have permission for this action'});
      }
    }
  });
});

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
    if(err) res.status(404).json(err);
    else res.json(posts);
  });
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
