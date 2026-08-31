// Article Model
const mongoose = require('mongoose');
const slugify = require('slug').default;

const articleSchema = new mongoose.Schema({
	headline: {
		type: String,
		required: [true, 'An article must have a headline'],
		trim: true,
		maxlength: [200, 'Headline cannot exceed 200 characters'],
	},
	summary: {
		type: String,
		required: [true, 'An article must have a summary'],
		trim: true,
		maxlength: [500, 'Summary cannot exceed 500 characters'],
	},
	content: {
		type: String,
		required: [true, 'An article must have content'],
	},
	category: {
		type: String,
		enum: ['politics', 'technology', 'business', 'science', 'health', 'sports', 'world'],
		required: [true, 'An article must have a category'],
	},
	source: {
		type: mongoose.Schema.ObjectId,
		ref: 'Source',
		required: [true, 'An article must have a source'],
	},
	url: {
		type: String,
		required: [true, 'An article must have a source URL'],
		validate: {
			validator: function (v) {
				return /^https?:\/\//.test(v);
			},
			message: 'URL must start with http:// or https://',
		},
	},
	image: String,
	neutralityScore: {
		type: Number,
		default: 0,
		min: 0,
		max: 100,
	},
	slug: String,
	author: String,
	publishedAt: {
		type: Date,
		default: Date.now,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		select: false,
	},
});

// Add slug before saving
articleSchema.pre('save', function (next) {
	this.slug = slugify(this.headline, { lower: true });
	next();
});

// Populate source on find
articleSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'source',
		select: 'name url logo',
	});
	next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
