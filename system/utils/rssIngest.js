/* eslint-disable no-console */
// RSS Feed Ingestion Script
// Fetches articles from RSS feeds and imports them into MongoDB
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Parser = require('rss-parser');

dotenv.config({ path: './config.env' });

const Article = require('./models/articleModel');
const Source = require('./models/sourceModel');

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DEV_DB, { serverSelectionTimeoutMS: 5000 });

const parser = new Parser();

// List of RSS feeds to monitor
const FEEDS = [
	{
		sourceName: 'BBC News',
		url: 'http://feeds.bbci.co.uk/news/rss.xml',
		category: 'world',
	},
	{
		sourceName: 'Reuters World',
		url: 'http://feeds.reuters.com/reuters/worldNews',
		category: 'world',
	},
	{
		sourceName: 'NPR Top Stories',
		url: 'http://www.npr.org/rss/rss.php?id=1001',
		category: 'world',
	},
	{
		sourceName: 'TechCrunch',
		url: 'http://feeds.feedburner.com/TechCrunch/',
		category: 'technology',
	},
];

// Calculate neutrality score based on source bias and word sentiment
const calculateNeutralityScore = (sourceBias, content) => {
	let score = 90; // Start neutral

	// Adjust based on source bias
	if (sourceBias === 'left') score -= 15;
	else if (sourceBias === 'right') score -= 15;
	else if (sourceBias === 'left-center') score -= 7;
	else if (sourceBias === 'right-center') score -= 7;

	// Simple sentiment check - penalize emotionally charged words
	const chargedWords = ['shocking', 'outrage', 'scandal', 'crisis', 'disaster', 'catastrophe'];
	const contentLower = content.toLowerCase();
	let chargedCount = 0;
	chargedWords.forEach((word) => {
		if (contentLower.includes(word)) chargedCount += 1;
	});
	score -= chargedCount * 2;

	return Math.max(0, Math.min(100, score));
};

// Strip HTML tags for summary
const stripHtml = (html) => {
	return html.replace(/<[^>]*>/g, '').substring(0, 500);
};

// Fetch and parse a single RSS feed
async function fetchFeed(feedConfig) {
	try {
		const response = await axios.get(feedConfig.url, {
			headers: { 'User-Agent': 'The Signal RSS Reader' },
			timeout: 10000,
		});

		const feed = await parser.parseString(response.data);

		// Get source from DB
		const source = await Source.findOne({ name: feedConfig.sourceName });
		if (!source) {
			console.log(`⚠️  Source not found: ${feedConfig.sourceName}`);
			return [];
		}

		console.log(`📡 ${feed.title || feedConfig.sourceName}: ${feed.items.length} items found`);

		const articles = [];
		for (const item of feed.items) {
			// Check if article already exists (prevent duplicates)
			const exists = await Article.findOne({ url: item.link });
			if (exists) continue;

			const content = item['content:encoded'] || item.content || '';
			const score = calculateNeutralityScore(source.bias, content || item.title);

			articles.push({
				headline: item.title || 'Untitled',
				summary: stripHtml(content) || (item.summary ? item.summary.substring(0, 500) : '') || '',
				content: content || item.contentSnippet || '',
				category: feedConfig.category,
				source: source._id,
				url: item.link,
				image: (item.enclosure && item.enclosure.url) || source.logo,
				neutralityScore: score,
				author: item.creator || item['dc:creator'] || source.name,
				publishedAt: item.pubDate || new Date(),
			});
		}

		return articles;
	} catch (err) {
		console.error(`❌ Error fetching feed ${feedConfig.sourceName}:`, err.message);
		return [];
	}
}

// Main function
async function ingestRSS() {
	try {
		console.log('RSS Ingestion Script');

		const allArticles = [];
		for (const feed of FEEDS) {
			const articles = await fetchFeed(feed);
			allArticles.push(...articles);
		}

		if (allArticles.length > 0) {
			const result = await Article.insertMany(allArticles, { ordered: false });
			console.log(`\n✅ Imported ${result.length} new articles`);
		} else {
			console.log('\nℹ️  No new articles to import');
		}

		process.exit(0);
	} catch (err) {
		console.error('❌ RSS Ingestion error:', err.message);
		process.exit(1);
	}
}

// Run the script
ingestRSS();
