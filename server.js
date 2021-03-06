// ===============================================================================================
// Require dotenv
require('dotenv').config();

// ===============================================================================================
// import dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

const { PORT, MONGODB_URI, CLIENT_ORIGIN } = require('./config');
const localStrategy = require('./auth/local');
const jwtStrategy = require('./auth/jwt');

const notesRouter = require('./routes/notes.routes');
const foldersRouter = require('./routes/folders.routes');
const tagsRouter = require('./routes/tags.routes');
const usersRouter = require('./routes/users/users.routes');
const authRouter = require('./routes/users/auth.routes');

// ===============================================================================================
// Make an express instance
const app = express();

// ===============================================================================================
// Log all requests. Skip logging during
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));

// ===============================================================================================
// CORS
app.use(
  cors({ origin: CLIENT_ORIGIN })
);
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-Access-Token, XKey, Authorization');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.options('*', cors());

// ===============================================================================================
// Parse request body
app.use(express.json());

// ===============================================================================================
// Utilize the given `strategy`
passport.use(localStrategy);
passport.use(jwtStrategy);

// ===============================================================================================
// Mount routers
app.use('/api/notes', notesRouter);
app.use('/api/folders', foldersRouter);
app.use('/api/tags', tagsRouter);

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);


app.get('/', function (req, res) {
  res.send('hello world');
});

// QUERY A COLLECTION
app.get('/api/users', function (req, res) {
  res.send(res);
});

// ===============================================================================================
// Catch-all 404
app.use(function (req, res, next) {
  const err = new Error('Not Found, something broke!');
  // err.status = 404;
  next(err);
});

// ===============================================================================================
// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function (err, req, res, next) {
  console.error('ERROR', err);
  res.status(err.status);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : err
  });
});

runMongoDbServer = (MONGODB_URI) => {
  const options = { useNewUrlParser: true };

  mongoose.connect('mongodb://mongodb:27017/grimoire', options)
    .then(instance => {
      const conn = instance.connections[0];
      console.info(`Connected to: mongodb://${conn.host}:${conn.port}/${conn.name}`);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error('\n === Did you remember to start `mongod`? === \n');
      console.error('error', err);
    });
}

runHttpServer = (PORT) => {
  app.listen(PORT, function () {
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    console.error(err);
  });
}

// ===============================================================================================
// Listen for incoming connections
if (require.main === module) {
  runMongoDbServer(MONGODB_URI);
  runHttpServer(PORT);
}

module.exports = app;
