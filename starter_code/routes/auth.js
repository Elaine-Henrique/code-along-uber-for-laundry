const express = require('express');
const router = express.Router();

const User = require('../models/user');

const bcrypt = require('bcrypt');
const bcryptSalt = 5;

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});

router.post('/signup', (req, res, next) => {
  const { name, email, password } = req.body;
  if (email === '' || password === '') {
    res.render('auth/signup', {
      errorMessage: 'Enter both email and password to sign up.'
    });
    return;
  }
  User.findOne({ email })
    .then((user) => {
      if (user !== null) {
        res.render('auth/signup', {
          errorMessage: `The email ${email} is already in use.`,
        });
      }
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashedPass = bcrypt.hashSync(password, salt);

      const newUser = new User({ name, email, password: hashedPass });
      newUser.save((err) => {
        if (err) {
          res.redirect('/signup');
        } else {
          res.redirect('/');
        }
      })
    })
    .catch(err => {
      console.log(err);
    });
});

router.get('/login', (req, res, next) => {
  res.render('auth/login');
})

router.post('/login', (req, res, next) => {
  const { email, password } = req.body
  console.log('login route', email)
  if (email === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'You can\'t login'
    });
    return;
  }

  User.findOne({email}, (err, user) => {
    console.log('login route', user)
    if (err || user === null) {
      res.render('auth/login', { errorMessage: 'Err there isn\'t an account' });
      return
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.render('auth/login', {
        errorMessage: 'Invalid password.'
      });
      return
    }
    req.session.currentUser = user;
    res.redirect('/');
  })
});

module.exports = router;
