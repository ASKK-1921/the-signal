const svgCaptcha = require('svg-captcha');

/**
 * Function to generate captcha elements
 * @param {request} req The request object
 * @param {response} res The response object
 * @param {next} next Next to move on to the next element
 * @returns {json} JSON containing status and generated captcha data
 */
exports.getCaptchaDeck = (req, res, next) => {
	const setCount = parseInt(req.query.setCount, 10) || 3;
	const captchaDeck = [];
	for (let i = 0; i < setCount; i++) {
		const captcha = svgCaptcha.create({
			size: 6,
			ignoreChars: '0Oo1lIi',
			noise: 1,
		});
		captchaDeck.push({ image: captcha.data, text: captcha.text });
	}

	return res.status(200).json({ status: 'success', captchaDeck });
};
