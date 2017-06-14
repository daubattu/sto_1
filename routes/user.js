import jwt from 'jsonwebtoken';
var User = require('../models/user.js');
var isEmpty = require('lodash/isEmpty');
import bcrypt from 'bcrypt';
import validateSignup from '../server/validate/validateSignup.js';
import validateLogin from '../server/validate/validateLogin.js';
import localStorage from 'localStorage';
import storage from 'node-persist';
import authenticate from '../server/middleware/authenticate.js';
import axios from 'axios';

module.exports = (app) => {

  app.get('/', (req, res) => {
    const token = localStorage.getItem('token');
    console.log(localStorage.getItem('token'));
    if(token) {
      setTokenAuthorizaton(token);
    }
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
    res.render('user/login');
  });

  app.post('/login', (req, res) => {
    const { errors, isValid } = validateLogin(req.body);
    if(isValid) {
      User.findOne({username: req.body.username}, (err, user) => {
        if(user) {
          if(bcrypt.compareSync(req.body.password, user.get('password'))) {
            let token = jwt.sign({
              id: user.get('_id'),
              username: user.get('username')
            }, 'somejsonwebtoken');
            localStorage.setItem('token', token);
            res.json({success: true, token});
          } else {
            res.json({errors: 'Password is not match with username'})
          }
        } else {
          res.status(404).json({success: false})
        }
      });
    } else {
      res.json({errors});
    }
  })

  app.get('/logout', authenticate, (req, res) => {
    const token = req.headers.authorization;
    if(token) {
        localStorage.removeItem('token');
        res.status(200).json({userLogout: req.decoded, token: req.headers.authorization, success: true});
    } else res.json({errors: 'You dont have any token for this action!!'});
  })
}
