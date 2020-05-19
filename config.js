module.exports = {
	PORT: process.env.PORT || 8080,
	CLIENT_ORIGIN: (process.env.NODE_ENV === 'production') ? process.env.CLIENT_ORIGIN : 'http://localhost:3000',
	MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/grimoire',
	TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost/grimoire-test',
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
};