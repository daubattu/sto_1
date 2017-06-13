import express from 'express';
import User from '../models/user.js';
import authenticate from '../server/middleware/authenticate.js';

let router = express.Router();


router.get('/users', authenticate, (req, res) => {
  User.find({}, function(err, users) {
    if(err) throw err;
    else {
      let usersRes = [];
      for(let i = 0; i < users.length; i++) {
        let user = new User();
        user.username = users[i].username;
        user.birthday = users[i].birthday;
        user.gender = users[i].gender;
        usersRes.push(user);
      }
      res.json({usersRes});
    }
  })
})

export default router;
