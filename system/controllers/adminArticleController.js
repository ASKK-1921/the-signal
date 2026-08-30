// Admin Article Controller - CRUD operations for articles
const Article = require('../models/articleModel');
const Source = require('../models/sourceModel');
const Category = require('../models/categoryModel');

// Get all articles for admin
exports.getAllArticles = async (req, res, next) => {
	try {
		const articles = await Article.find().sort('-createdAt');
		res.status(200).json({
			status: 'success',
			results: articles.length,
			data: {
				articles,
			},
		});
	} catch (err) {
		next(err);
	}
};

// Get single article
exports.getArticle = async (req, res, next) => {
	try {
		const article = await Article.findById(req.params.id);
		if (!article) {
			return res.status(404).json({
				status: 'fail',
				message: 'No article found with that ID',
			});
		}
		res.status(200).json({
			status: 'success',
			data: { article },
		});
	} catch (err) {
		next(err);
	}
};

// Create article
exports.createArticle = async (req, res, next) => {
	try {
		const newArticle = await Article.create(req.body);
		res.status(201).json({
			status: 'success',
			data: { article: newArticle },
		});
	} catch (err) {
		next(err);
	}
};

// Update article
exports.updateArticle = async (req, res, next) => {
	try {
		const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!article) {
			return res.status(404).json({
				status: 'fail',
				message: 'No article found with that ID',
			});
		}
		res.status(200).json({
			status: 'success',
			data: { article },
		});
	} catch (err) {
		next(err);
	}
};

// Delete article
exports.deleteArticle = async (req, res, next) => {
	try {
		const article = await Article.findByIdAndDelete(req.params.id);
		if (!article) {
			return res.status(404).json({
				status: 'fail',
				message: 'No article found with that ID',
			});
		}
		res.status(204).json({ status: 'success', data: null });
	} catch (err) {
		next(err);
	}
};

// Get sources for dropdown
exports.getSources = async (req, res, next) => {
	try {
		const sources = await Source.find();
		res.status(200).json({
			status: 'success',
			results: sources.length,
			data: { sources },
		});
	} catch (err) {
		next(err);
	}
};

// Get categories for dropdown
exports.getCategories = async (req, res, next) => {
	try {
		const categories = await Category.find();
		res.status(200).json({
			status: 'success',
			results: categories.length,
			data: { categories },
		});
	} catch (err) {
		next(err);
	}
};
