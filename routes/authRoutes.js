const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ensure = require('connect-ensure-login');

const User = require('../models/userModel.js');


const authRoutes = express.Router();
authRoutes.get('/contact',
    //        redirects to '/' (home page) if you ARE logged in
  //ensure.ensureNotLoggedIn('/'),

  (req, res, next) => {
    res.render('contact.ejs');
  }
);


authRoutes.get('/signup',
    //        redirects to '/' (home page) if you ARE logged in
  ensure.ensureNotLoggedIn('/'),

  (req, res, next) => {
    res.render('auth/signUp.ejs');
  }
);


// <form method="post" action="/signup">
authRoutes.post('/signup',
  //        redirects to '/' (home page) if you ARE logged in
  //                      |
  ensure.ensureNotLoggedIn('/'),

  (req, res, next) => {
    const emailInput = req.body.emailInput;
    const signupPassword = req.body.signupPassword;

    // Don't let users submit blank emails or passwords
    if (emailInput === '' || signupPassword === '') {
      res.render('auth/signUp.ejs', {
        errorMessage: 'Please provide both email and password.'
      });
      return;
    }
    // Check password length, characters
    // if (signupPassword.length<=1 || signupPassword.length >=10) {
    //   res.render('auth/signUp.ejs', {
    //     errorMessage: 'Password need to have between 3 and 10 characters.'
    //   });
    //   return;
    // }

    User.findOne(
      // 1st arg -> criteria of the findOne (which documents)
      { email: emailInput },
      // 2nd arg -> projection (which fields)
      { email: 1 },
      // 3rd arg -> callback
      (err, foundUser) => {
        if (err) {
          next(err);
          return;
        }

        // Don't let the user register if the email is taken
        if (foundUser) {
          res.render('auth/signUp.ejs', {
            errorMessage: 'email is already taken. Please use another'
          });
          return;
        }

        // We are good to go, time to save the user.

        // Encrypt the password
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(signupPassword, salt);

        // Create the user
        const theUser = new User({
          firstName: req.body.firstNameInput,
          lastName: req.body.lastNameInput,
          email: emailInput,
          phone: req.body.phoneInput,
          //address:,
          country:req.body.countryInput,
          encryptedPassword: hashPass
        });

        // Save it
        theUser.save((err) => {
          if (err) {
            next(err);
            return;
          }

          // Store a message in the box to display after the redirect
          req.flash(
            // 1st arg -> key of message
            'success',
            // 2nd arg -> the actual message
            'You have registered successfully!'
          );

          // Redirect to home page if save is successful
          res.redirect('/');
        });
      }
    );
  }
);

authRoutes.get('/login',
    //        redirects to '/' (home page) if you ARE logged in
    //                      |
  ensure.ensureNotLoggedIn('/'),

  (req, res, next) => {

    res.render('auth/loginView.ejs', {
      errorMessage: req.flash('error')
        //                       |
    }); //    default name for error messages in Passport
  }
);

// <form method="post" action="/login">
authRoutes.post('/login',
    //        redirects to '/' (home page) if you ARE logged in
    //                      |
  ensure.ensureNotLoggedIn('/'),

    //                   local as in "LocalStrategy" (our method of logging in)
    //                     |
  passport.authenticate('local', {
    successRedirect: '/',
    successFlash: true,        // req.flash('success')
    failureRedirect: '/login',
    failureFlash: true         // req.flash('error')
  } )
);

authRoutes.get('/logout', (req, res, next) => {
  // req.logout() method provided by Passport
  req.logout();

  //req.flash('success', 'You have logged out successfully.');

  res.redirect('/');
});


module.exports = authRoutes;