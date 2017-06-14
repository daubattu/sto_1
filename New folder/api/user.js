import express from 'express';
import User from '../models/user.js';
import authenticate from '../server/middleware/authenticate.js';

let router = express.Router();

router.get('/', authenticate, (req, res) => {
  User.find({}, function(err, users) {
    if(err) throw err;
    else {
      res.json({users});
    }
  })
})

export default router;
