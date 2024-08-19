'use strict';

const config = {
	appConfig: {
		port: process.env.APP_PORT || 3000,
	},
	db: {
		host: process.env.DB_HOST || '127.0.0.1',
		user: process.env.DB_USERNAME || 'root',
		database: process.env.DB_DATABASE || 'root',
		password: process.env.DB_PASSWORD || '',
	},
};

const env = process.env.NODE_ENVIRONMENT || 'local';

module.exports = config;