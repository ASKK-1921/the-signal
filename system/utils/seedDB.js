// Seed Script - Populate MongoDB with sample news articles
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// Models
const Article = require('../models/articleModel');
const Source = require('../models/sourceModel');
const Category = require('../models/categoryModel');

// Set up DB connection
mongoose.set('strictQuery', false);

// Sample sources
const sources = [
	{
		name: 'BBC News',
		url: 'https://www.bbc.com/news',
		logo: 'https://news.bbcimg.co.uk/image/upload/f_auto/q_auto/h_80/production/_/brandwidth/news/1488889/brand-pc/dirty-white-scheme/2x/2023/08/bbc-news-logo-desktop.svg',
		bias: 'center',
		description:
			'BBC News is a department of the BBC newsgathering process responsible for the gathering and presentation of news from a British perspective.',
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

// Helper to pick a random item
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate sample articles
const articles = (sourceIds) => {
	const articleData = [
		{
			headline: 'Global Summit Reaches Historic Climate Agreement',
			summary:
				'World leaders have agreed to a new framework for carbon emissions reductions, marking the most significant climate deal in a decade.',
			content:
				'<h2>Global Climate Milestone</h2><p>In an unprecedented move, delegates from 195 countries gathered this week to finalize a sweeping climate agreement aimed at reducing global carbon emissions by 50% by 2035.</p><p>The accord, known as the Geneva Protocol, establishes binding targets for both developed and emerging economies. Experts say it could serve as a turning point in international climate diplomacy.</p><p>"We are witnessing history today," said UN Secretary-General Maria Lopez. "The world has come together with a shared sense of urgency and purpose."</p>',
			category: 'world',
			image: 'https://images.unsplash.com/photo-1510561369610-4a4cb51e6a5e?ixlib=rb-4.0.3&w=800',
			url: 'https://www.reuters.com/world/climate-summit',
			author: 'Reuters Staff',
		},
		{
			headline: 'AI Regulation Bill Passes Key Senate Committee',
			summary:
				'The proposed legislation aims to establish federal oversight for artificial intelligence systems, with proponents arguing it balances innovation with safety.',
			content:
				'<h2>Senate Advances AI Oversight</h2><p>The Artificial Intelligence Accountability Act cleared a major hurdle after a 14-9 vote in the Senate Commerce Committee, setting the stage for a full Senate floor debate next month.</p><p>The bill would require companies developing high-risk AI systems to undergo annual audits and maintain transparency logs. It also creates a new office within the Department of Commerce to coordinate federal AI policy.</p><p>Supporters argue the framework protects consumers without stifling technological progress.</p>',
			category: 'technology',
			image: 'https://images.unsplash.com/photo-1677442136064-255013255819?ixlib=rb-4.0.3&w=800',
			url: 'https://www.npr.org/2025/04/15/ai-regulation',
			author: 'NPR News',
		},
		{
			headline: 'Federal Reserve Signals Potential Rate Cut Ahead of Summer',
			summary:
				'Central bank officials hinted at monetary policy adjustments amid cooling inflation data and labor market concerns.',
			content:
				'<h2>Potential Shift in Monetary Policy</h2><p>Federal Reserve Chair Jerome Powell indicated this week that the central bank is prepared to lower interest rates as early as the summer quarterly meeting, citing "encouraging signs of price stability" and "a recalibration of labor market dynamics."</p><p>The announcement comes after a closely watched Consumer Price Index report showed headline inflation declining to 2.8% year-over-year last month, down from a peak of 9.1% in mid-2022.</p><p>"We are monitoring conditions closely," Powell said during his press conference following the Fed\'s two-day policy meeting.</p>',
			category: 'business',
			image: 'https://images.unsplash.com/photo-1581090763574-5f7e2b3a8e92?ixlib=rb-4.0.3&w=800',
			url: 'https://www.bbc.com/news/business-fed',
			author: 'BBC Business',
		},
		{
			headline: 'New Alzheimer Treatment Shows Promise in Late-Stage Trials',
			summary:
				'Researchers report a 40% reduction in cognitive decline among patients receiving the experimental drug over an 18-month period.',
			content:
				'<h2>Breakthrough in Neurodegenerative Disease Research</h2><p>A long-acting antibody therapy designed to clear amyloid plaques in the brain has demonstrated statistically significant results in a Phase 3 clinical trial involving 3,200 participants over 75 years old.</p><p>The treatment, developed jointly by researchers at Stanford and Roche, targets the underlying pathology of Alzheimer\'s disease rather than just managing symptoms. Lead investigator Dr. Emily Chen called the results "exceptionally encouraging."</p><p>The drug has yet to receive FDA approval but is expected to enter the review process by early next year.</p>',
			category: 'health',
			image: 'https://images.unsplash.com/photo-1559757148-5a3e5c873c6a?ixlib=rb-4.0.3&w=800',
			url: 'https://www.reuters.com/health/alzheimers-trial',
			author: 'Reuters Health',
		},
		{
			headline: 'Mars Rover Discovers Possible Signs of Ancient Microbial Life',
			summary:
				"NASA's Perseverance rover has identified organic compounds in Jezero Crater that may indicate past habitability on the Red Planet.",
			content:
				'<h2>Red Planet Revelations</h2><p>NASA announced today that the Perseverance Mars rover has found compelling evidence of organic molecules preserved in sedimentary rock within Jezero Crater, suggesting the area was once a lake with conditions conducive to life.</p><p>The discovery includes complex carbon chains and phosphate minerals that, on Earth, are typically associated with biological processes. While the mission team cautions that abiotic explanations exist, the findings represent the strongest evidence yet for Mars\' ancient habitability.</p><p>"This is a groundbreaking moment," said project scientist Ken Farley. "We\'re not saying aliens — but we\'re definitely seeing signs that Mars could have supported life."</p>',
			category: 'science',
			image: 'https://images.unsplash.com/photo-1544982503-9f98e0c67b73?ixlib=rb-4.0.3&w=800',
			url: 'https://www.bbc.com/news/science/mars-rover',
			author: 'BBC Science',
		},
		{
			headline: 'Supreme Court Hears Oral Arguments in Landmark Voting Rights Case',
			summary:
				'The court is weighing challenges to a federal law requiring backup paper ballots in states with histories of voting discrimination.',
			content:
				'<h2>High-Stakes Constitutional Showdown</h2><p>The U.S. Supreme Court heard oral arguments today in <em>Louisiana v. Gingles</em>, a case that could reshape voting rights enforcement nationwide. At issue is Section 2 of the Voting Rights Act, specifically provisions requiring jurisdictions with a history of discriminatory practices to maintain backup paper ballot systems.</p><p>Conservative justices questioned whether the requirement imposes undue burdens, while liberal justices pressed on the importance of verifiable paper trails. A decision is expected by late June.</p><p>Civil rights groups have mobilized behind the law, arguing it’s essential for election integrity.</p>',
			category: 'politics',
			image: 'https://images.unsplash.com/photo-1586926406020-f1c473a790b7?ixlib=rb-4.0.3&w=800',
			url: 'https://apnews.com/supreme-court-voting-rights',
			author: 'Associated Press',
		},
		{
			headline: 'England Wins UEFA Euro 2024 in Dramatic Penalty Shootout',
			summary:
				'In what is being called one of the greatest finals in tournament history, England defeated Spain 5-4 on penalties after a 1-1 draw.',
			content:
				'<h2>Historic Finale for English Football</h2><p>In front of 75,000 fans at the Olympiastadion in Berlin, England clinched its first major trophy since 1968 in a thrilling conclusion to UEFA Euro 2024.</p><p>The match saw Spain take an early lead through midfielder Rodri, only for England’s Harry Kane to equalize in the 76th minute. The game then went to penalties after a gripping 120 minutes of extra time left the score tied.</p><p>England’s goalkeeper Jordan Pickford saved Spain’s fourth penalty, sealing a dramatic victory for the Three Lions.</p>',
			category: 'sports',
			image: 'https://images.unsplash.com/photo-1574629287745-d3597c445247?ixlib=rb-4.0.3&w=800',
			url: 'https://www.bbc.com/sport/football/euro-2024',
			author: 'BBC Sport',
		},
		{
			headline: 'Quantum Computing Milestone Reached by International Research Team',
			summary:
				'Scientists achieve sustained quantum coherence at room temperature, potentially accelerating practical quantum computing applications.',
			content:
				'<h2>Room Temperature Quantum Breakthrough</h2><p>An international team of physicists has achieved a key milestone in quantum computing research by demonstrating sustained quantum coherence at room temperature — a challenge that has long plagued the field.</p><p>The researchers, led by MIT and the University of Tokyo, used engineered defects in diamond lattices to trap and stabilize qubit states for longer than ever before. Their technique could dramatically reduce the cooling requirements for scalable quantum processors.</p><p>"This breakthrough removes a major barrier to commercial quantum computing," said lead researcher Dr. Yuki Tanaka. "We’re closer to real-world applications now."</p>',
			category: 'science',
			image: 'https://images.unsplash.com/photo-1581090763584-bce2fc95f1c9?ixlib=rb-4.0.3&w=800',
			url: 'https://www.reuters.com/science/quantum-breakthrough',
			author: 'Reuters Science',
		},
		{
			headline: 'Renewable Energy Surpasses Coal in Global Electricity Generation',
			summary:
				'New data shows wind and solar accounted for 38% of global power production last year, marking a historic shift away from fossil fuels.',
			content:
				'<h2>Energy Transition Accelerates</h2><p>For the first time in modern history, renewable energy sources collectively accounted for more electricity generation globally than coal-fired power plants, according to data released this week by the International Energy Agency (IEA).</p><p>In 2025, wind turbines and solar panels generated approximately 8,200 terawatt-hours of electricity, narrowly edging out coal’s 8,000 terawatt-hours. Hydroelectric power, geothermal, and other renewables contributed an additional 1,800 terawatt-hours.</p><p>"This is a watershed moment," said IEA Executive Director Fatih Birol. "The transition is irreversible, driven by economics and policy alike."</p>',
			category: 'technology',
			image: 'https://images.unsplash.com/photo-1506502363169-1c3c7b5d7e5a?ixlib=rb-4.0.3&w=800',
			url: 'https://www.npr.org/renewables-vs-coal',
			author: 'NPR Planet Money',
		},
	];

	return articleData.map((a, i) => ({
		...a,
		source: pickRandom(sourceIds),
		neutralityScore: Math.floor(Math.random() * 20) + 80,
		publishedAt: new Date(Date.now() - i * 86400000),
	}));
};

// Main seed function
const seedDB = async () => {
	try {
		// Connect to the database
		await mongoose.connect(process.env.DEV_DB, {
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});
		console.log('✅ Connected to MongoDB');

		// Clear existing data
		await Article.deleteMany();
		await Source.deleteMany();
		await Category.deleteMany();

		// Insert categories
		const catResult = await Category.insertMany(categories);
		console.log('✅ Categories seeded:', catResult.length);

		// Insert sources
		const srcResult = await Source.insertMany(sources);
		console.log('✅ Sources seeded:', srcResult.length);

		// Generate and insert articles
		const sampleArticles = articles(srcResult.map((s) => s._id));
		const artResult = await Article.insertMany(sampleArticles);
		console.log('✅ Articles seeded:', artResult.length);

		console.log('\n🎉 Database seeded successfully!');

		// List the categories for reference
		console.log('\n📂 Categories:');
		catResult.forEach((cat) => console.log(`   - ${cat.name} (${cat.slug})`));

		// List the sources for reference
		console.log('\n📰 Sources:');
		srcResult.forEach((src) => console.log(`   - ${src.name}`));

		process.exit();
	} catch (err) {
		console.error('❌ Seed error:', err.message);
		process.exit(1);
	}
};

// Run seed
seedDB();
