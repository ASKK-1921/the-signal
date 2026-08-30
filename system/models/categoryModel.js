// Category Model
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A category must have a name'],
		trim: true,
		unique: true,
	},
	slug: {
		type: String,
		required: true,
		unique: true,
	},
	color: {
		type: String,
		default: '#6366f1',
	},
	order: {
		type: Number,
		default: 0,
	},
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
