// --- DEPENDENCIES ---
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// --- SCHEMA ---
const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, 'Users must have a first name'],
		},
		lastName: {
			type: String,
			required: [true, 'Users must have a last name'],
		},
		email: {
			type: String,
			required: [true, 'Users must have an email'],
			unique: true,
			lowercase: true,
			trim: true,
			validate: [validator.isEmail, 'Please provide a valid email address'],
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minLength: 8,
			select: false,
		},
		passwordConfirm: {
			type: String,
			required: [true, 'Password confirm is required'],
			validate: {
				// This only works on save!
				validator: function (val) {
					return val === this.password; //If passwords match, validation passed
				},
				message: 'Passwords do not match',
			},
		},
		passwordChangedAt: {
			type: Date,
		},
		passwordResetToken: {
			type: String,
		},
		passwordResetExpires: {
			type: Date,
		},
		active: {
			type: Boolean,
			default: true,
			select: false,
		},
		accountCreated: {
			type: Date,
		},
		accountActivationToken: {
			type: String,
		},
	},
	// Enable virtual population
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// --- MIDDLEWARE ---

// Add "account created" timestamp for new users
userSchema.pre('save', function (next) {
	if (this.isNew) {
		this.accountCreated = Date.now();
		const activationToken = crypto.randomBytes(16).toString('hex');
		this.accountActivationToken = crypto.createHash('sha256').update(activationToken).digest('hex');
	}
	next();
});

// Encrypt password when creating/updating
userSchema.pre('save', async function (next) {
	// Only run if the password was modified
	if (!this.isModified('password')) return next();

	// Encrypt password (hashed with a cost of 12)
	this.password = await bcrypt.hash(this.password, 12);

	// Delete passwordConfirm field
	this.passwordConfirm = undefined;
	next();
});

// Set passwordChangedAt timestamp
userSchema.pre('save', function (next) {
	// Only run if the password was modified and user already existed
	if (!this.isModified('password') || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

// --- METHODS ---

// Check passwords during login
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

// Check for recent password changes
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JWTTimestamp < changedTimestamp;
	}

	// Here, false indicates no changes
	return false;
};

// Create token for user to reset password
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(16).toString('hex');
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	// Set expiry time of 10 minutes
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

// --- VIRTUAL POPULATE ---

// // Sample
// userSchema.virtual('fieldname', {
// 	ref: 'ExternalModel',
// 	foreignField: 'fieldInOtherModel',
// 	localField: '_id',
// });

// Set model and make available to system
const User = mongoose.model('User', userSchema);
module.exports = User;
