// This file configures passport.
const passport = require('passport')
const User = require('../models/user')
const config = require('../config')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local')

// A JWT Strategy is a method for logging an user in.
// There are dozens of strategies available for passport as plugins.
// Examples: facebook login, google login, jwt, username and password -login.

// --- Create Local login strategy ---
// For login in with an username and a password (when user logs in later on after account exists).
const localOptions = { usernameField: 'email' }
const localLogin = new LocalStrategy(localOptions, function (email, password, done) {
  // Verify this username and password,
  // then call done with the user if
  // it is the correct username password,
  // otherwise call done with false.
  User.findOne({ email: email }, function(error, user) {
    // Server error.
    if ( error ) {
      return done(error)
    }

    // User was not found.
    if ( !user ) {
      return done(null, false)
    }

    // User found.
    // Compare passwords. Is 'password' equal to user.password?
    user.comparePassword(password, function (error, isMatch) {
      // Server error.
      // Call done with the server error.
      if ( error ) {
        return done(error)
      }

      // Passwords do not match.
      // Call done with no error and false.
      if ( !isMatch ) {
        return done(null, false)
      }

      // Passwords match. 
      // Call done with no error and the user object.
      return done(null, user)
    })
  })
})

//  --- Create JWT login Strategy. ---
// For login in with a jwt token (when user signs up or makes auth'd requests to server).

// Set up options for our JWT Strategy.
const jwtOptions = {
  // Tell passport-jwt where to look for the jwt token.
  // In this case its send in our header called "authorization".
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),

  // Passport-jwt also needs to know the secret for decoding the token.
  secretOrKey: config.secret
}

// JwtStrategy takes two arguments: the options object and a function
// with arguments "payload", which is the encrypted jwt token
// and "done" which is a callback function that is to be called with
// user object if authentication succeeded, or without an object if login failed.
const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
  // See if a user ID in the payload exists in our database?
  // If it does, call "done" with that user object,
  // otherwise call "done" without a user object.
  User.findById(payload.sub, function(error, user) {
    if ( error ) {
      // First argument to done() is the error object and
      // the second one is the user object if we found one
      // or false if we didnt.
      return done(error, false)
    }

    if ( user ) {
      // Succesfully found user. 
      // And we have no error. Call done() here without an error and with the user object.
      done(null, user)
    } else {
      // Did not found a user.
      // And we have no error. So call done() with without an error and false
      done(null, false)
    }


  })
})

// --- Tell passport to use these strategies. ---
passport.use(jwtLogin)
passport.use(localLogin)
