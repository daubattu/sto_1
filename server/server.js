var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var ejs = require('ejs');
var engine = require('ejs-mate');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

import post from '../api/post.js';
import user from '../api/user.js';
import me from '../api/me.js';
import commentPost from '../routes/comment.js';

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
app.use('/api/posts', post);
app.use('/api/me', me);
app.use('/posts/comment', commentPost);

app.listen(3000);
