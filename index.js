// Main starting point of the application.

// Nodemon is used via the "dev" command defined in package.json
// to restart our server anytime we make changes to the code.
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const router = require('./router')

const app = express()

// --- Database setup ---

// Passing "localhost:auth/auth"" as the connect string
// to mongoose creates a new database in MongoDB called "auth"
mongoose.connect('mongodb://localhost:auth/auth')


// --- App setup ---

// Morgan and bodyParser are both node middlewares
// so all the requests our app receives will
// be passed onto both morgan and bodyParser.

// Morgan is a logging middleware
// it just logs the requests we want to the console.
app.use(morgan('combined'))

// Bodyparser is a middleware that is used to parse
// incoming requests. We use it to parse the requests to json.
app.use(bodyParser.json({ type: '*/*' }))

// Initialize app routing. Routing is setup in the router.js file.
router(app)


// --- Server setup ---

// If there is a environment variable "PORT" already defined
// then use it, otherwise default to "3090".
const port = process.env.PORT || 3090

// Create a basic http server and forward the requests
// to our Express application (app).
const server = http.createServer(app)

// Start listening to our port.
server.listen(port)
console.log('Server listening on: ', port)


