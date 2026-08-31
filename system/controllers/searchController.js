// Search Controller
const Article = require('../models/articleModel');
require('../models/sourceModel');

// Search articles
exports.search = async (req, res, next) => {
	try {
		const { q, category, source, limit = 20 } = req.query;

		let query = Article.find();

		if (q) {
			query = query.or([
				{ headline: { $regex: q, $options: 'i' } },
				{ summary: { $regex: q, $options: 'i' } },
				{ content: { $regex: q, $options: 'i' } },
			]);
		}

		if (category) {
			query = query.find({ category });
		}

		if (source) {
			query = query.find({ source });
		}

		const articles = await query
			.sort('-publishedAt')
			.limit(limit * 1)
			.exec();

		// For rendered page
		if (!req.originalUrl.startsWith('/api')) {
			return res.status(200).render('search-results', {
				articles,
				query: q || '',
				category: category || '',
			});
		}

		// For API
		res.status(200).json({
			status: 'success',
			results: articles.length,
			data: { articles },
		});
	} catch (err) {
		next(err);
	}
};
