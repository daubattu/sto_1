import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import validateSignup from '../server/validate/validateSignup.js';
import validateLogin from '../server/validate/validateLogin.js';
import authenticate from '../server/middleware/authenticate.js';
import useragent from 'useragent';
import Post from '../models/Post';
import axios from 'axios';
import _ from 'lodash';

module.exports = (app) => {

  app.get('/', (req, res) => {
    res.render('index');
  });

  app.get('/signup', (req, res) => {
    res.render('user/signup');
  });

  app.post('/signup', (req, res) => {

    let { errors, isValid } = validateSignup(req.body);

    console.log(errors, isValid);

    if(isValid) {
      User.findOne({username: req.body.username}, (err, user) => {
        if(user) {
          errors.form = 'Deprecated username!!!';
          res.json({errors});
        } else {
          let user = new User();

          user.username = req.body.username;
          user.password = bcrypt.hashSync(req.body.password, 10);
          user.birthday = req.body.birthday;
          user.gender = req.body.gender;

          user.save((err, user) => {
            if(err) res.json({errors: err});
            else res.json({user});
          })
        }
      })
    } else {
      res.json({errors});
    }
  });

  app.get('/login', (req, res) => {
    if(req.session.token) res.json({message: "You are logging!!! Do you want to logout?"});
    else res.render('user/login');
  });

  app.post('/login', (req, res) => {
    console.log(req.session.token);
    if(req.session.token) res.json({token: req.session.token, message: 'You have already login!!!'});
    else {
      const { errors, isValid } = validateLogin(req.body);
      if(isValid) {
        User.findOne({username: req.body.username}, (err, user) => {
          if(user) {
            if(bcrypt.compareSync(req.body.password, user.get('password'))) {
              let token = jwt.sign({
                _id: user.get('_id'),
                username: user.get('username')
              }, 'somejsonwebtoken');

              req.session.token = token;
              res.status(200).json({token});
            } else {
              res.json({errors.password: 'Password is not match with username'})
            }
          } else {
            res.json({errors.username: 'Not found'})
          }
        });
      } else {
        res.json({errors: 'Not found'});
      }
    }
  })

  app.get('/logout', authenticate, (req, res) => {
    if(req.session.token) {
        req.session.destroy();
        res.status(200).json({userLogout: req.decoded.username, tokenLogout: req.headers.authorization});
    } else res.status(401).json({errors: 'You need login before for this action!!!'});
  })

}
