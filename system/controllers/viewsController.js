// --- DEPENDENCIES ---
const Article = require('../models/articleModel');
// Ensure Source model is registered for populate to work
require('../models/sourceModel');

// --- CONTROLLER FUNCTIONS ---

// Home page - show latest articles (with optional category filter)
exports.getHomePage = async (req, res, next) => {
	try {
		let query = Article.find().sort('-publishedAt').limit(20);

		// Category filter from query param
		if (req.query.category) {
			query = query.find({ category: req.query.category });
		}

		const articles = await query.exec();
		res.status(200).render('home', { articles });
	} catch (err) {
		next(err);
	}
};

// About page
exports.getAboutPage = (req, res) => {
	res.status(200).render('about');
};

// Article detail page
exports.getArticlePage = async (req, res, next) => {
	try {
		const article = await Article.findOne({ slug: req.params.slug });
		if (!article) {
			return res.status(404).render('error', {
				title: '404',
				msg: 'No article found with that slug',
			});
		}
		res.status(200).render('article', { article });
	} catch (err) {
		next(err);
	}
};
