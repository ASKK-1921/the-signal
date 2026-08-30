/**
 * Conveniently wrap async functions throughout the system
 * @param {function} fn Must contain (req, res, next)
 * @returns {function} If the function does not throw an exception or error
 */
module.exports = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch(next);
	};
};
