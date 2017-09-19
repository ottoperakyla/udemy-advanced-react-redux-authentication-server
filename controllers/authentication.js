const jwt = require('jwt-simple')
const User = require('../models/user')
const config = require('../config')

// Generates a jwt token for use in user authentication.
function tokenForUser (user) {
  // The "sub"-property (short for subject) is a convention in json web tokens.
  // It is used to describe what this token is about. In this case its the user id.
  // The "iat"-property (issued at time) is also a jwt convention.
  const timestamp = new Date().getTime()
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret)
}

exports.signup = function (request, response, next) {
  // Request.body contains an object with the data from the post-request.
  const email = request.body.email
  const password = request.body.password

  if ( !email || !password ) {
    return response
      .status(422)
      .send({ error: 'You must provide email and password.' })
  }

  // --- See if a user with the given email exists? ---

  // Model.findOne({ params }) searches the database for a first match.
  // It receives a callback function with an error object
  // and the resultObject (named existingUser here) as parameters.
  User.findOne({ email: email }, function (error, existingUser) {
    // Some database error occuded. Pass the error to next() and return it.
    if ( error ) {
      return next(error)
    }

    // --- If a user with email does exist, return an error. ---
    if ( existingUser ) {
      // A http status of 422 means "unprosessable entity".
      // Aka it means the data the user gave to us is bad.
      // Since the user already exists with this email.
      return response
        .status(422)
        .send({ error: 'Email is in use' })
    }

    // ---  If a user with email does NOT exist, create and save a new user record. ---

    // Calling "new User" only creates the User object in memory.
    // It DOES NOT actually insert a MongoDB database record.
    const newUser = new User({
      email: email,
      password: password
    })

    // Calling "user.save()" inserts the record to the MongoDB database.
    // Save() receives a callback with error object.
    // The callback will be called when the insertion is done.
    newUser.save(function(error) {
      if ( error ) {
        return next(error)
      }

      // --- Respond to request indicating that user was created. ---
      response.json({ token: tokenForUser(newUser) })
    })

  })

}

exports.signin = function(request, response, next) {
  // User has already had their email and password auth'd.
  // We just need to give them a token.

  // Request.user is provided to us by the passport callback.
  response.send({ token: tokenForUser(request.user) })
}
