// Admin Auth Controller
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || '90d',
	});
};

// Check if user is admin
exports.isAdmin = async (req, res, next) => {
	try {
		// 1) Get token
		let token;
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1];
		} else if (req.cookies && req.cookies.jwt) {
			token = req.cookies.jwt;
		}

		if (!token) {
			return res.status(401).json({
				status: 'fail',
				message: 'You are not logged in!',
			});
		}

		// 2) Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// 3) Check if user still exists
		const currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return res.status(401).json({
				status: 'fail',
				message: 'The user no longer exists.',
			});
		}

		// 4) Check if user is admin
		if (currentUser.role !== 'admin') {
			return res.status(403).json({
				status: 'fail',
				message: 'You do not have permission to perform this action.',
			});
		}

		// Grant access
		req.user = currentUser;
		next();
	} catch (err) {
		next(err);
	}
};

// Login page
exports.getLogin = (req, res) => {
	res.status(200).render('admin/login', {
		title: 'Admin Login',
	});
};

// Login handler
exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		// 1) Check if email and password exist
		if (!email || !password) {
			return res.status(400).json({
				status: 'fail',
				message: 'Please provide email and password!',
			});
		}

		// 2) Check if user exists & password is correct
		const user = await User.findOne({ email }).select('+password');

		if (!user || !(await user.correctPassword(password, user.password))) {
			return res.status(401).json({
				status: 'fail',
				message: 'Incorrect email or password!',
			});
		}

		// 3) Check if user is admin
		if (user.role !== 'admin') {
			return res.status(403).json({
				status: 'fail',
				message: 'You do not have admin access.',
			});
		}

		// 4) Create token
		const token = signToken(user._id);

		// Set cookie
		const cookieOptions = {
			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
		};

		res.cookie('jwt', token, cookieOptions);

		// Send response
		res.status(200).json({
			status: 'success',
			token,
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
			},
		});
	} catch (err) {
		next(err);
	}
};

// Logout handler
exports.logout = (req, res) => {
	res.cookie('jwt', '', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ status: 'success' });
};
