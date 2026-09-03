/* eslint-disable no-console */
// RSS Feed Ingestion Script
// Workflow: RSS Ingestion → fetch article from URL → Remove images → Extract main content → Strip HTML → Score neutrality → Store in DB

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Parser = require('rss-parser');
const cheerio = require('cheerio');

dotenv.config({ path: './config.env' });

const Article = require('../models/articleModel');
const Source = require('../models/sourceModel');
const slugify = require('slug').default;

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DEV_DB, { serverSelectionTimeoutMS: 5000 });

const parser = new Parser();

// List of RSS feeds to monitor — categorized by section
const FEEDS = [
	// BBC News — all topics
	{
		sourceName: 'BBC News',
		url: 'http://feeds.bbci.co.uk/news/rss.xml',
		category: 'world',
	},
	// BBC by section (more granular categories)
	{
		sourceName: 'BBC News',
		url: 'http://feeds.bbci.co.uk/news/politics/rss.xml',
		category: 'politics',
	},
	{
		sourceName: 'BBC News',
		url: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
		category: 'technology',
	},
	{
		sourceName: 'BBC News',
		url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
		category: 'business',
	},
	{
		sourceName: 'BBC News',
		url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
		category: 'science',
	},
	{
		sourceName: 'BBC News',
		url: 'http://feeds.bbci.co.uk/news/health/rss.xml',
		category: 'health',
	},
	{
		sourceName: 'BBC News',
		url: 'http://feeds.bbci.co.uk/sport/rss.xml',
		category: 'sports',
	},
	// Reuters
	{
		sourceName: 'Reuters',
		url: 'http://feeds.reuters.com/reuters/worldNews',
		category: 'world',
	},
	// NPR
	{
		sourceName: 'NPR',
		url: 'http://www.npr.org/rss/rss.php?id=1001',
		category: 'world',
	},
	// TechCrunch
	{
		sourceName: 'TechCrunch',
		url: 'http://feeds.feedburner.com/TechCrunch/',
		category: 'technology',
	},
];

// Step 1: Fetch article HTML from the URL
async function fetchArticleHTML(url) {
	try {
		const response = await axios.get(url, {
			headers: { 'User-Agent': 'The Signal RSS Reader 1.0' },
			timeout: 15000,
		});
		return response.data;
	} catch (err) {
		console.log(`    ⚠️  Could not fetch article from ${url}: ${err.message}`);
		return null;
	}
}

// Step 2: Remove images (for copyright concerns)
function removeImages(html) {
	const $ = cheerio.load(html);
	$('img').remove();
	return $.html();
}

// Step 3: Extract main article content using common selectors
function extractMainContent(html) {
	const $ = cheerio.load(html);

	const selectors = [
		'article',
		'.article-body',
		'.article-content',
		'.entry-content',
		'.post-content',
		'.story-body',
		'.story',
		'.content',
		'.main-content',
		'#main',
		'#content',
		'.article__content',
		'.article__body',
		'.post-body',
		'.post-entry',
		'.mce-body',
		'[class*="article"]',
		'[class*="content"]',
	];

	let content = '';
	for (const selector of selectors) {
		const element = $(selector);
		if (element && element.length > 0) {
			const htmlStr = element.html();
			if (htmlStr && htmlStr.length > 200) {
				content = element.html();
				break;
			}
		}
	}

	// If no good content found via selectors, try collecting all paragraphs
	if (!content || content.length < 200) {
		const paragraphs = [];
		$('p').each((i, el) => {
			const text = $(el).text().trim();
			if (text.length > 20) {
				paragraphs.push(text);
			}
		});
		if (paragraphs.length > 0) {
			content = paragraphs.map((p) => `<p>${p}</p>`).join('\n');
		}
	}

	return content || '';
}

// Step 4: Strip HTML tags and format as paragraphs
function extractPlainText(html) {
	if (!html) return '';
	const $ = cheerio.load(html);
	let text = $('body').text();
	text = text.replace(/\s+/g, ' ').trim();
	return text;
}

function formatAsParagraphs(html) {
	if (!html) return '';
	const $ = cheerio.load(html);
	const paragraphs = [];
	$('p').each((i, el) => {
		const text = $(el).text().trim();
		if (text.length > 10) {
			paragraphs.push(`<p>${text}</p>`);
		}
	});
	if (paragraphs.length === 0) {
		const text = extractPlainText(html);
		if (text.length > 100) {
			return text
				.split(/(?:\n\s*){2,}/)
				.filter((p) => p.trim().length > 20)
				.map((p) => `<p>${p.trim()}</p>`)
				.join('\n');
		}
	}
	return paragraphs.join('\n');
}

// Step 5: Calculate neutrality score based on source bias and word sentiment
const calculateNeutralityScore = (sourceBias, content) => {
	let score = 90; // Start neutral

	if (sourceBias === 'left') score -= 15;
	else if (sourceBias === 'right') score -= 15;
	else if (sourceBias === 'left-center') score -= 7;
	else if (sourceBias === 'right-center') score -= 7;

	const chargedWords = [
		'shocking', 'outrage', 'scandal', 'crisis', 'disaster', 'catastrophe',
		'unprecedented', 'devastating', 'horrific', 'alarming', 'emergency',
		'chaos', 'collapse', 'warning', 'breaking', 'exclusive',
	];
	const contentLower = (content || '').toLowerCase();
	let chargedCount = 0;
	chargedWords.forEach((word) => {
		if (contentLower.includes(word)) chargedCount += 1;
	});
	score -= chargedCount * 2;

	return Math.max(0, Math.min(100, score));
};

// Strip HTML tags for summary
const stripHtml = (html) => {
	if (!html) return '';
	const $ = cheerio.load(html);
	return $('body').text().replace(/\s+/g, ' ').trim().substring(0, 500);
};

// Fetch full article content from the article URL using the complete workflow
async function fetchFullArticleContent(url) {
	// Step 1: Fetch article HTML from the URL
	const html = await fetchArticleHTML(url);
	if (!html) return { content: '', summary: '' };

	// Step 2: Remove images (for copyright concerns)
	const htmlNoImages = removeImages(html);

	// Step 3: Extract main article content using common selectors
	const mainContent = extractMainContent(htmlNoImages);

	// Step 4: Strip HTML tags and format as paragraphs
	const plainText = extractPlainText(mainContent);
	const formattedContent = formatAsParagraphs(mainContent);

	// Generate summary from first 500 chars of plain text
	const summary = plainText.substring(0, 500);

	return {
		content: formattedContent || `<p>${plainText}</p>`,
		summary: summary || '',
	};
}

// Fetch and parse a single RSS feed
async function fetchFeed(feedConfig) {
	try {
		const response = await axios.get(feedConfig.url, {
			headers: { 'User-Agent': 'The Signal RSS Reader' },
			timeout: 10000,
		});

		const feed = await parser.parseString(response.data);

		const source = await Source.findOne({ name: feedConfig.sourceName });
		if (!source) {
			console.log(`⚠️  Source not found: ${feedConfig.sourceName}`);
			return [];
		}

		console.log(`📡 ${feed.title || feedConfig.sourceName}: ${feed.items.length} items found`);

		const articles = [];
		for (let i = 0; i < feed.items.length; i++) {
		 const item = feed.items[i];
			const exists = await Article.findOne({ url: item.link });
			if (exists) {
				console.log(`  ↻ Already exists: ${item.title?.substring(0, 50)}...`);
				continue;
			}

			const rssSummary = item.summary || item.contentSnippet || '';

			let fullContent = '';
			let fullSummary = stripHtml(rssSummary) || '';

			if (item.link) {
				console.log(`    📄 Fetching: ${item.title?.substring(0, 60)}...`);
				const fetched = await fetchFullArticleContent(item.link);
				if (fetched.content) {
					fullContent = fetched.content;
					fullSummary = fetched.summary || stripHtml(rssSummary);
					console.log(`    ✅ Full content: ${fullContent.length} chars`);
				} else {
					fullContent = `<p>${stripHtml(rssSummary || item.title || '')}</p>`;
					fullSummary = stripHtml(rssSummary) || '';
					console.log(`    ⚠️  Using RSS summary only`);
				}
			}

			const score = calculateNeutralityScore(source.bias, fullContent);

			articles.push({
				headline: item.title || 'Untitled',
				slug: slugify(item.title || 'untitled', { lower: true }),
				summary: fullSummary,
				content: fullContent,
				category: feedConfig.category,
				source: source._id,
				url: item.link,
				image: source.logo,
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
		console.log('📡 RSS Ingestion Script');
		console.log('📋 Workflow: RSS ingest → fetch URL → remove images → extract content → score neutrality → store');
		console.log('');

		const allArticles = [];
		for (const feed of FEEDS) {
			const articles = await fetchFeed(feed);
			allArticles.push(...articles);
		}

		if (allArticles.length > 0) {
			const result = await Article.insertMany(allArticles, { ordered: false });
			console.log(`\n✅ Imported ${result.length} new articles`);
			const avgScore = allArticles.reduce((sum, a) => sum + a.neutralityScore, 0) / allArticles.length;
			console.log(`📊 Average neutrality score: ${avgScore.toFixed(1)}/100`);
		} else {
			console.log('\nℹ️  No new articles to import');
		}

		process.exit(0);
	} catch (err) {
		console.error('❌ RSS Ingestion error:', err.message);
		process.exit(1);
	}
}

ingestRSS();
