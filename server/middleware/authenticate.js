import jwt from 'jsonwebtoken';
import User from '../../models/user.js';

export default(req, res, next) => {
  const token = req.session.token;
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
    res.status(401).json({message: 'You need login for this action!!!'})
  }
}
