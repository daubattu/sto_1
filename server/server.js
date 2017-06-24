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

var db = 'mongodb://admin:admin@ds121222.mlab.com:21222/sto';
mongoose.connect(db);

let app = express();

app.engine('ejs', engine);
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUnitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
  next();
})

require('../routes/user.js')(app);
require('../routes/chat.js')(app);
app.use('/api/users', user);
app.use('/api/posts', post);
app.use('/api/me', me);

app.listen(8080);
