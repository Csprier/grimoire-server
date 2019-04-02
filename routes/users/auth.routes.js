const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// SCHEMA
const User = require('../models/user');

const { JWT_SECRET, JWT_EXPIRY } = require('../../config');

const router = express.Router();

const localAuth = passport.authenticate('local', { session: false, failWithError: true });
router.use(bodyParser.json());
// Login endpoint for login
router.post('/login', localAuth, (req, res) => {
	const authToken = createAuthToken(req.user);
	return res.status(200).json({ authToken });
});

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });
// Refresh AuthToken
router.post('/refresh', jwtAuth, (req, res, next) => {
	User.findById(req.user.id)
  .then(user => {
    const authToken = createAuthToken(user);
    res.json({ authToken });
  })
  .catch(err => {
    console.error(err);
    next(err);
  });
});

// Generate AuthToken for user
const createAuthToken = (user) => {
	return jwt.sign({ user }, JWT_SECRET, {
		subject: user.username,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
	});
};

module.exports = router;
