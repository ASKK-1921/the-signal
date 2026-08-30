// Admin Routes
const express = require('express');
const adminAuthController = require('../controllers/adminAuthController');
const adminArticleController = require('../controllers/adminArticleController');

const router = express.Router();

// Auth routes (no auth required)
router.get('/login', adminAuthController.getLogin);
router.post('/login', adminAuthController.login);
router.get('/logout', adminAuthController.logout);

// All routes after this middleware require admin authentication
router.use(adminAuthController.isAdmin);

// Admin dashboard
router.get('/', (req, res) => {
	res.status(200).render('admin/dashboard', { user: req.user });
});

// Article management (API + views)
router.route('/articles').get(adminArticleController.getAllArticles).post(adminArticleController.createArticle);

router
	.route('/articles/:id')
	.get(adminArticleController.getArticle)
	.patch(adminArticleController.updateArticle)
	.delete(adminArticleController.deleteArticle);

router.get('/sources', adminArticleController.getSources);
router.get('/categories', adminArticleController.getCategories);

module.exports = router;
