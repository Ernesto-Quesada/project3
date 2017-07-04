const express = require('express');
const ensure = require('connect-ensure-login');
const bcrypt = require('bcrypt');

const User = require('../models/userModel.js');
const Family = require('../models/userFamily.js');


const routeforUser = express.Router();
// routeforUser.get('/user/:id', (req, res, next) => {

routeforUser.get('/profile',
    ensure.ensureLoggedIn('/login'),

    (req, res, next) => {
        res.render('user/userProfile.ejs', {
        successMessage: req.flash('success')
        });
    }
);

routeforUser.get('/relative/new', (req, res, next) => {
  res.render('user/addFamily.ejs', {
  });
  console.log('<><><><>',req.user._id)
});

//-------add a relative-----

routeforUser.post('/relative/new', (req, res, next) => {
  const myUserId =req.user._id
  console.log('esta es my user Id form req.body',myUserId)

  User.findById(myUserId, (err, theUser) => {
    if (err) {
      next(err);
      return;
    }
    

      //     REQUIRES THE REVIEW MODEL
      //                     |
    const newFamily = new Family({
      name: req.body.relativeName,
      firstApell: req.body.firstApell,
      secondApell: req.body.secondApell,
      cIdentidad:req.body.carnetId,
      phone:req.body.phoneRelative,
      address: req.body.addressRelative,
      parentesco: req.body.parentesco,
      email: req.body.emailRelative,
      country:req.body.country,
      
    });
    
    theUser.family.push(newFamily);
    console.log('family',theUser.family.length);
    theUser.save((err) => {
      
      if (err) {
        next(err);
        return;
      }
       
      res.redirect('/profile');
    });
  });
});













// <form method="post" action="/profile/edit">
routeforUser.post('/profile/edit',
  ensure.ensureLoggedIn('/login'),
  (req, res, next) => {
    const profileName = req.body.profileName;
    const profileUsername = req.body.profileUsername;
    const currentPassword = req.body.profileCurrentPassword;
    const newPassword = req.body.profileNewPassword;

    if (profileName === '' || profileUsername === '' || currentPassword==='' || newPassword ==='') {
      res.render('user/editUserProfile.ejs', {
        errorMessage: 'Please all info is required.'
      });
      return;
    }
    if (newPassword.length<=6 || newPassword.length >=12) {
      res.render('user/editUserProfile.ejs', {
        errorMessage: 'Password need to have between 6 and 12 characters.'
      });
      return;
    }

    User.findOne(
      { username: profileUsername },
      { username: 1 },
      (err, foundUser) => {
        if (err) {
          next(err);
          return;
        }

        // if there's a user with the username and it's not you
        if (foundUser && !foundUser._id.equals(req.user._id)) {
          res.render('user/edit-profile-view.ejs', {
            errorMessage: 'Username already taken.'
          });
          return;
        }


        // add updates from form
        req.user.name = req.body.profileName;
        req.user.username = req.body.profileUsername;

        // if both passwords are filled and the current password is correct
        if (currentPassword && newPassword
            && bcrypt.compareSync(currentPassword, req.user.encryptedPassword)) {
          // add new encryptedPassword to the updates
          const salt = bcrypt.genSaltSync(10);
          const hashPass = bcrypt.hashSync(newPassword, salt);
          // profileChanges.encryptedPassword = hashPass;
          req.user.encryptedPassword = hashPass;
        }

        // save updates!
        req.user.save((err) => {
          if (err) {
            next(err);
            return;
          }

          req.flash('success', 'Changes saved.');

          res.redirect('/profile/edit');
        });


      }
    );
  }
);


// Query to make people admins in MongoDB shell
// db.users.updateOne(
//   { username: 'nizar' },
//   { $set: { role: 'admin' } }
// )
routeforUser.get('/myaccount',
  ensure.ensureLoggedIn(),

  (req, res, next) => {
    Photo.find(
      { owner: req.user._id },

      (err, photoList) => {
        if (err) {
          next(err);
          return;
        }

        res.render('user/myaccount.ejs', {
          myAccountPhotoList: photoList,
        //   successMessage: req.flash('success')
        });
      }
    );
  }
);

routeforUser.get('/users', (req, res, next) => {
  // If you are logged in AND and admin LEZ DO THIS
  if (req.user && req.user.role === 'admin') {
    User.find((err, usersList) => {
      if (err) {
        next(err);
        return;
      }

      res.render('user/users-list-view.ejs', {
        users: usersList,
        successMessage: req.flash('success')
      });
    });
  }

  // Otherwise show 404 page
  else {
    next();
  }
});


routeforUser.post('/users/:id/admin', (req, res, next) => {
  // If you are logged in AND and admin LEZ DO THIS
  if (req.user && req.user.role === 'admin') {
    User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      (err, theUser) => {
        if (err) {
          next(err);
          return;
        }

        req.flash('success', `User "${theUser.name}" is now an admin. 😎`);

        res.redirect('/users');
      }
    );
    return;
  }

  // Otherwise show 404 page
  else {
    next();
  }
});


module.exports = routeforUser;