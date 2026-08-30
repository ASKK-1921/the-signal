// Destructure sample data from seedDB.js and export for testing
// Sample categories
const categories = [
	{ name: 'Politics', slug: 'politics', color: '#ef4444', order: 1 },
	{ name: 'Technology', slug: 'technology', color: '#3b82f6', order: 2 },
	{ name: 'Business', slug: 'business', color: '#f59e0b', order: 3 },
	{ name: 'Science', slug: 'science', color: '#10b981', order: 4 },
	{ name: 'Health', slug: 'health', color: '#ec4899', order: 5 },
	{ name: 'Sports', slug: 'sports', color: '#8b5cf6', order: 6 },
	{ name: 'World', slug: 'world', color: '#06b6d4', order: 7 },
];

// Sample sources
const sources = [
	{
		name: 'BBC News',
		url: 'https://www.bbc.com/news',
		logo: 'https://news.bbcimg.co.uk/image/upload/f_auto/q_auto/h_80/production/_/brandwidth/news/1488889/brand-pc/dirty-white-scheme/2x/2023/08/bbc-news-logo-desktop.svg',
		bias: 'center',
		description: 'BBC News is a trusted UK-based news outlet with global reach.',
	},
	{
		name: 'Reuters',
		url: 'https://www.reuters.com',
		logo: 'https://www.reuters.com/purpose/logo.svg',
		bias: 'center',
		description: 'Reuters is a news agency headquartered in London, UK, that provides global coverage in English.',
	},
	{
		name: 'Associated Press',
		url: 'https://apnews.com',
		logo: 'https://apnews.com/Brand/AP1.png',
		bias: 'center',
		description:
			'The Associated Press is a news cooperative that provides the majority of the political coverage for many newspapers and broadcast outlets.',
	},
	{
		name: 'NPR',
		url: 'https://www.npr.org',
		logo: 'https://media.npr.org/assets/img/2023/08/01/npr-logo-23-svg.svg',
		bias: 'left-center',
		description: 'National Public Radio (NPR) is an American publicly funded radio network and multimedia company.',
	},
	{
		name: 'Reuters UK',
		url: 'https://uk.reuters.com',
		logo: 'https://www.reuters.com/purpose/logo.svg',
		bias: 'center',
		description: 'Reuters UK provides trusted international coverage for British audiences.',
	},
];

module.exports = { categories, sources };
