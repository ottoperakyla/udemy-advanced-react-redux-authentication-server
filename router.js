// Router.js contains the routing setup for the application.
const Authentication = require('./controllers/authentication')
const passportService = require('./services/passport')
const passport = require('passport')

// Create a passport instance using the jwt strategy.
// And dont create a session for the user. 
// Since we are using tokens we do not want to create a session.
const requireAuth = passport.authenticate('jwt', { session: false })

const requireSignin = passport.authenticate('local', { session: false })

module.exports = function (app) {
  // Request contains information about the request the user made.
  // Response is what we send to back to the user.
  // Next can be optionally used for error handling.  
  
  // Pass requireAuth as an middleware to the route.
  // Any requests that attempt to get / must first
  // pass the requireAuth middleware.
  app.get('/', requireAuth, function(request, response){
    response.send({ hi: 'there' })
  })
  app.post('/signin', requireSignin, Authentication.signin)
  app.post('/signup', Authentication.signup)
  
}
