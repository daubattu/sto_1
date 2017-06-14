import isEmpty from 'lodash/isEmpty';

export default function validatePost(post) {
  let errors = {};
  if(isEmpty(user.username)) {
    errors.username = 'This field is require!!!';
  }
  if(isEmpty(user.password)) {
    errors.password = 'This field is require!!!';
  }
   return {
     errors,
     isValid: isEmpty(errors)
   }
}
