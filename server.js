/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
	console.log('=x_x= UNCAUGHT EXCEPTION =x_x= : Shutting down server...');
	console.log(err.name, err.message);

	// Shut down server with exit code of 1 for uncaught exception
	process.exit(1);
});

// Set location of environment configuration file
dotenv.config({ path: './config.env' });

// Set location of entry point of the system
const app = require('./app');

// Set credentials for DB connection
const db = () => {
	// Use the development database
	if (process.env.NODE_ENV === 'development') {
		return process.env.DEV_DB.replace('<PASSWORD>', process.env.DEV_DB_PASSWORD);
	}
	// Use the test database
	if (process.env.NODE_ENV === 'test') {
		return process.env.TEST_DB.replace('<PASSWORD>', process.env.TEST_DB_PASSWORD);
	}
	// Use the production database
	return process.env.PROD_DB.replace('<PASSWORD>', process.env.PROD_DB_PASSWORD);
};

// Establish connection to the database
mongoose
	.set('strictQuery', false)
	.connect(db(), { useUnifiedTopology: true, useNewUrlParser: true })
	.then(() => console.log('=^_^= DB Connection successful =^_^='));

// Set listening port
const port = process.env.PORT || 3000;

// Start the server
const server = app.listen(port, () => {
	console.log(`=^_^= Server listening on port ${port} =^_^=`);
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
		console.log(` <!> Working in ${process.env.NODE_ENV} mode <!>`);
	}
});

// Safety net to catch unhandled rejections and log details
process.on('unhandledRejection', (err) => {
	console.log('=x_x= UNHANDLED REJECTION =x_x= : Shutting down server...');
	console.log(err.name, err.message);

	// End all processes with server.close before shutting down with exit code of 1
	server.close(() => {
		process.exit(1);
	});
});
