// Source Model - for news outlets
const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A source must have a name'],
		trim: true,
		unique: true,
	},
	url: {
		type: String,
		required: [true, 'A source must have a URL'],
		validate: {
			validator: function (v) {
				return /^https?:\/\//.test(v);
			},
			message: 'URL must start with http:// or https://',
		},
	},
	logo: String,
	bias: {
		type: String,
		enum: ['left', 'left-center', 'center', 'right-center', 'right', 'unknown'],
		default: 'unknown',
	},
	description: String,
});

const Source = mongoose.model('Source', sourceSchema);

module.exports = Source;
