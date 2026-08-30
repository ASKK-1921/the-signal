/**
 * Function to conveniently set cookies from anywhere in the system
 * @param {response} res The res object
 * @param {string} name The name of the cookie
 * @param {string} value The value of the cookie
 * @param {Date} expiry The expiry date of the cookie
 */
exports.setCookie = (res, name, value, expiry) => {
	res.cookie(name, value, {
		expires: expiry,
		httpOnly: true,
	});
};

/**
 * Function to conveniently remove cookies from anywhere in the system
 * @param {response} res The res object
 * @param {string} name The name of the cookie
 * @param {string} value Any short string is fine
 */
exports.clearCookie = (res, name, value) => {
	res.cookie(name, value, {
		expires: new Date(Date.now() + 10),
		httpOnly: true,
	});
};
