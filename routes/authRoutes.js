const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ensure = require('connect-ensure-login');

const User = require('../models/userModel.js');


const authRoutes = express.Router();
// authRoutes.get('/contact',
//     //        redirects to '/' (home page) if you ARE logged in
//   //ensure.ensureNotLoggedIn('/'),

//   (req, res, next) => {
//     res.render('contact.ejs');
//   }
// );


// authRoutes.get('/signup',
//     //        redirects to '/' (home page) if you ARE logged in
//   ensure.ensureNotLoggedIn('/'),

//   (req, res, next) => {
//     res.render('auth/signUp.ejs');
//   }
// );


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
      // res.render('auth/signUp.ejs', {
      //   errorMessage: 'Please provide both email and password.'
      // });
      // return;
      {
    res.status(400).json({ message: 'Provide username and password.' });
    return;
  }
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
          // 
          res.status(500).json({ message: 'Something went wrong.' });
          return;
        }

        // Don't let the user register if the email is taken
        if (foundUser) {
          // res.render('auth/signUp.ejs', {
          //   errorMessage: 'email is already taken. Please use another'
          // });
          // return;
          res.status(400).json({ message: 'The username already exists.' });
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
            // next(err);
            // return;
            res.status(500).json({ message: 'Something went wrong.' });
            return;
          }

          // Store a message in the box to display after the redirect
          // req.flash(
          //   // 1st arg -> key of message
          //   'success',
          //   // 2nd arg -> the actual message
          //   'You have registered successfully!'
          // );

          // Redirect to home page if save is successful
          //res.redirect('/');
          req.login(theUser, (err) => {
            if (err) {
              res.status(500).json({ message: 'Something went wrong.' });
              return;
            }

            res.status(200).json(req.user);
          });
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
//++++++LOGIN WORKING ON EXPRESS++++
// <form method="post" action="/login">
// authRoutes.post('/login',
//     //        redirects to '/' (home page) if you ARE logged in
//     //                      |
//   ensure.ensureNotLoggedIn('/'),

//     //                   local as in "LocalStrategy" (our method of logging in)
//     //                     |
//   passport.authenticate('local', {
//     successRedirect: '/profile',
//     successFlash: true,        // req.flash('success')
//     failureRedirect: '/login',
//     failureFlash: true         // req.flash('error')
//   } )
// );

//-------LOGIN BY NICK-----
authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
    if (err) {
      res.status(500).json({ message: 'Something went wrong.' });
      return;
    }

    if (!theUser) {
      res.status(401).json(failureDetails);
      return;
    }

    req.login(theUser, (err) => {
      if (err) {
        res.status(500).json({ message: 'Something went wrong.' });
        return;
      }

      res.status(200).json(req.user);
    });
  })(req, res, next);
});

authRoutes.get('/logout', (req, res, next) => {
  // req.logout() method provided by Passport
  req.logout();

  //req.flash('success', 'You have logged out successfully.');

  res.redirect('/');
});


authRoutes.get('/loggedin', (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('i get in here ---------')
    res.status(200).json(req.user);
    return;
  }

  res.status(401).json({ message: 'Unauthorized.' });
});





module.exports = authRoutes;