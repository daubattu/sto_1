import jwt from 'jsonwebtoken';
import User from '../../models/user.js';

export default(req, res, next) => {
  const authorizationHeader = req.headers['authorization'];
  let token;
  if(authorizationHeader) {
    token = authorizationHeader.split(' ')[1];
  }

  if(token) {
    jwt.verify(token, 'somejsonwebtoken', function(err, decoded) {
      if (err) {
        res.status(400).json({ success: false, message: 'Token error!!!' });
      } else {
        req.decoded = decoded;
        req.headers.authorization = token;
        next();
      }
    });
  } else {
    let errors = {};
    errors.login = 'You need login for this action';
    res.status(400).json({errors});
  }
}
