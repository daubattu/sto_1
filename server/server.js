var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var ejs = require('ejs');
var engine = require('ejs-mate');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

import post from '../routes/post.js';
import user from '../api/user.js';
import me from '../api/me.js';

import localStorage from 'localStorage';
import setTokenAuthorizaton from './middleware/setTokenAuthorizaton';

var db = 'mongodb://admin:admin@ds121222.mlab.com:21222/sto';
mongoose.connect(db);

let app = express();

app.engine('ejs', engine);
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUnitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

require('../routes/user.js')(app);
app.use('/api/users', user);
app.use('/posts', post);
app.use('/api/me', me);

if(localStorage.getItem('token') !== '') {
  setTokenAuthorizaton(localStorage.getItem('token'));
}

app.listen(3000, (req, res) => {
  console.log('Server is running on port 3000!!!');
});
