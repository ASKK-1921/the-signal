// --- DEPENDENCIES ---
const express = require('express');

// --- CONTROLLERS ---
const viewsController = require('../controllers/viewsController');

// --- ROUTER ---
const router = express.Router();

// --- ROUTES ---

// Public pages
router.get('/', viewsController.getHomePage);
router.get('/about', viewsController.getAboutPage);
router.get('/article/:slug', viewsController.getArticlePage);

// --- EXPORTS ---
module.exports = router;
