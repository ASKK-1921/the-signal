const fs = require('fs');
const cookieManager = require('./cookieManager');

/**
 *	Load text from a JSON file according to language cookie settings
 * @param {request} req The Express request
 * @param {response} res The Express response
 * @param {string} errorPage The error code if applicable
 * @returns {json} Text data for the page
 */
module.exports = (req, res, errorPage = false) => {
	let language = req.query.lang ? req.query.lang : req.cookies.lang || 'en';
	const languageFiles = `./public/languages`;

	// Default to English file if no language file exists
	if (!fs.existsSync(`${languageFiles}/${language}.json`)) {
		language = 'en';
	}

	// Set the language cookie if it doesn't exist or is different to the requested language
	if (!req.cookies.lang || req.query.lang !== req.cookies.lang) {
		const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
		cookieManager.setCookie(res, 'lang', language, expiry);
	}

	const languageFile = fs.readFileSync(`${languageFiles}/${language}.json`);
	const languageFileParsed = JSON.parse(languageFile);

	const currentPage = errorPage || `${req.url}`;

	const languagePack = languageFileParsed[currentPage];

	return languagePack;
};
