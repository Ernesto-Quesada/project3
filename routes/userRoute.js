const express = require('express');
const ensure = require('connect-ensure-login');
const bcrypt = require('bcrypt');

const User = require('../models/userModel.js');
//const Family = require('../models/userFamily.js');
const Relative = require('../models/relativeModel.js');



const routeforUser = express.Router();
// routeforUser.get('/user/:id', (req, res, next) => {

routeforUser.get('/profile',
    ensure.ensureLoggedIn('/login'),

    (req, res, next) => {
      
        res.render('user/userProfile.ejs', {
          user:req.user,
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
// <form method="post" action="/signup">
routeforUser.post('/relative/new',
  //        redirects to login if you ARE logged in
  //                      |
  ensure.ensureLoggedIn('/login'),
  (req, res, next) => {

    const nameR = req.body.relativeName;
    const firstApellR = req.body.firstApell;
    const secondApellR = req.body.secondApell;
    const cIdentidadR = req.body.carnetId;
//   const phoneR = req.body.phoneRelative,
    const addressR = req.body.addressRelative;
    const parentescoR = req.body.parentesco;
//       emailR: req.body.emailRelative,
//       countryR:req.body.country,

    // Don't let users submit blank relatives info-----poner esto abajo|| addressR === '' || parentescoR === ''
    if (nameR === '' || firstApellR === '' || secondApellR === '' ) {
      res.render('user/addFamily.ejs', {
        errorMessage: 'Please provide all required fields.'
      });
      return;
    }


    Relative.findOne(
      // 1st arg -> criteria of the findOne (which documents)
      { cIdentidad: cIdentidadR },
      // 2nd arg -> projection (which fields)
      { cIdentidad: 1 },
      // 3rd arg -> callback
      (err, foundRelative) => {
        if (err) {
          next(err);
          return;
        }

        // Don't let the user register if the email is taken
        if (foundRelative) {
          res.render('user/addFamily.ejs', {
            errorMessage: 'member already in list'
          });
          return;
        }

        // We are good to go, time to save the user.

        // Create the user
        const theRelative = new Relative({
          name: nameR,
          firstApell:     firstApellR,
          secondApell:    secondApellR,
          relativeOfUser: req.user._id,
          cIdentidad:     cIdentidadR,
         // phone:phoneR,
          address:        addressR,
          parentesco:     parentescoR,
          //email: emailR,
          //country:countryR,
        });

        // Save it
        theRelative.save((err) => {
          if (err) {
            next(err);
            return;
          }

          // Store a message in the box to display after the redirect
          req.flash(
            // 1st arg -> key of message
            'success',
            // 2nd arg -> the actual message
            'You have registered your family member successfully!'
          );

          // Redirect to home page if save is successful
          res.redirect('/profile');
        });
      }
    );
  }
);






// routeforUser.post('/relative/new', (req, res, next) => {
//   const myUserId =req.user._id
//   console.log('esta es my user Id form req.body',myUserId)

//   User.findById(myUserId, (err, theUser) => {
//     if (err) {
//       next(err);
//       return;
//     }
//     //     REQUIRES THE Family MODEL
//       //                     |
//     const newRelative = new Relative({
//       name: req.body.relativeName,
//       firstApell: req.body.firstApell,
//       secondApell: req.body.secondApell,
//       cIdentidad:req.body.carnetId,
//       phone:req.body.phoneRelative,
//       address: req.body.addressRelative,
//       parentesco: req.body.parentesco,
//       email: req.body.emailRelative,
//       country:req.body.country,
//      });
//     theUser.relative.push(newRelative._id);
//     console.log('RELATIVE',theUser.relative.length);
//     theUser.save((err) => {
//       if (err) {
//         next(err);
//         return;
//       }
//       res.redirect('/profile');
//     });
//   });
// });


routeforUser.get('/useramount/:familyid',(req,res,next)=>{
//                              |
const myFamilyId =req.params.familyid;
User.findById(req.user.family, (err, theRelative) =>{
if (err){
    next(err);
    return;
}
    console.log('tehrelative',theRelative);
    console.log('reuser',req.user);
    console.log('myfamily',req.user.family)
res.render('user/amount.ejs',{
  //passing family to the view
    theFamily: theRelative
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