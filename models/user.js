// Mongoose is a library used to make working with
// the MongoDB database easier. It is a so called "ORM"
// or "object relational mapping" to the database.
const mongoose = require('mongoose')

// Schema is used to describe what kind of
// fields our model has. 
const Schema = mongoose.Schema

// Bcrypt is a library that is used to crypt passwords.
const bcrypt = require('bcrypt-nodejs')

// Defining the model fields.
const userSchema = new Schema({
  email: { 
    type: String, 
    // Email is defined as an unique property.
    // So multiple users can not be created with the same email.
    unique: true,
    // It is also given the "lowercase: true" -property,
    // because MongoDB is not case sensitive, so that 
    // the emails seppo@gmail.com and SEPPO@GMAIL.COM
    // are converted to the same value when saving the user. 
    lowercase: true 
  },
  password: String
})

// On Save Hook, encrypt password.
// Before saving a model, run this function.
userSchema.pre('save', function (next) {
  // Get access to the user model.
  const user = this

  // Generate a salt (a random string of characters).
  // This takes some time, so it receives a callback function.
  // That runs after salt generation is done.
  bcrypt.genSalt(10, function (error, salt) {
    // Handle possible error.
    if ( error ) {
      return next(error)
    }

    // Hash (encrypt) our password with the salt.
    // The result is a crypted version of the password
    // that contains both the salt and the hashed plaintext password.
    // This also takes time, so it receives a callback.
    bcrypt.hash(user.password, salt, null, function (error, hash) {
      // Handle possible error.
      if ( error ) {
        return next(error)
      }

      // Replace plaintext user.password with the encrypted password.
      user.password = hash
      // Next() inside a hook means this hook is done, go ahead and save the model.
      next()
    })
  })
})

// The methods -object on a schema can be used to define
// custom functions that will be available on an object
// created with the schema.
// 'candidatePassword' is what the user is giving us.
userSchema.methods.comparePassword = function (candidatePassword, callback) {
  // Compare the password the user gave to us to the actual salted and hashed
  // password of this user instance.
  // this.password is the salted and hashed password of this user instance.
  bcrypt.compare(candidatePassword, this.password, function(error, isMatch) {
    // Server error.
    // Call callback with the error object.
    if ( error ) {
      return callback(error)
    }

    // No server error.
    // Call callback with no error and the isMatch boolean (can be true or false).
    // This 'comparePassword' method is used in the 'passport.js' file.
    callback(null, isMatch)
  })
}

// Creating the model class.
const ModelClass = mongoose.model('user', userSchema)

// Exporting the model.
module.exports = ModelClass
