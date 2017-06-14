import isEmpty from 'lodash/isEmpty';

export default function validateSignup(user) {
  let errors = {};
  if(isEmpty(user.username)) {
    errors.username = 'This field is require!!!';
  }
  if(isEmpty(user.password)) {
    errors.password = 'This field is require!!!';
  }
  if(isEmpty(user.birthday)) {
    errors.birthday = 'This field is require!!!';
  }
  if(isEmpty(user.gender)) {
    errors.gender = 'This field is require!!!';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
