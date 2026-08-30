// Article Controller
const Article = require('../models/articleModel');
const APIFeatures = require('../utils/apiFeatures');

// Get all articles
exports.getAllArticles = async (req, res, next) => {
	try {
		// Build query
		let query = Article.find();

		// Text search (headline, summary, content)
		if (req.query.search) {
			query = query.or([
				{ headline: { $regex: req.query.search, $options: 'i' } },
				{ summary: { $regex: req.query.search, $options: 'i' } },
				{ content: { $regex: req.query.search, $options: 'i' } },
			]);
		}

		const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();

		const articles = await features.query;

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

// Get single article by slug
exports.getArticle = async (req, res, next) => {
	try {
		const article = await Article.findOne({ slug: req.params.slug });

		if (!article) {
			return res.status(404).json({
				status: 'fail',
				message: 'No article found with that slug',
			});
		}

		res.status(200).json({
			status: 'success',
			data: {
				article,
			},
		});
	} catch (err) {
		next(err);
	}
};

// Create new article
exports.createArticle = async (req, res, next) => {
	try {
		const newArticle = await Article.create(req.body);

		res.status(201).json({
			status: 'success',
			data: {
				article: newArticle,
			},
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
			data: {
				article,
			},
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

		res.status(204).json({
			status: 'success',
			data: null,
		});
	} catch (err) {
		next(err);
	}
};
