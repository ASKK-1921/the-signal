<div id="top"></div>

<!-- PROJECT SHIELDS -->
[![License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<div align="center">
<h3 align="center">The Signal</h3>

  <p align="center">
    A neutral news website built with Node.js, Express, and MongoDB
    <br />
    <a href="#getting-started"><strong>Getting started »</strong></a>
    <br />
    <br />
    <a href="https://github.com/ASKK-1921/the-signal/issues">Report Bug</a>
    ·
    <a href="https://github.com/ASKK-1921/the-signal/issues">Request Feature</a>
  </p>
</div>

## About The Project

The Signal is a neutral news platform dedicated to providing unbiased, fact-checked reporting. We aggregate news from multiple sources across the political spectrum and present the facts without spin.

### Built With

* [Node.js](https://nodejs.org/)
* [Express](https://expressjs.com/)
* [EJS](https://ejs.co/)
* [Sass](https://sass-lang.com/)
* [MongoDB](https://www.mongodb.com/)
* [Gulp](https://gulpjs.com/)
* [Mocha](https://mochajs.org/)

## Getting Started

### Prerequisites

* Node.js (>= 14.17.6)
* MongoDB Atlas account
* npm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ASKK-1921/the-signal.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a `config.env` file:
   ```env
   NODE_ENV=development
   PORT=3000

   DEV_DB=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/the-signal-dev?retryWrites=true&w=majority

   JWT_SECRET=add-a-secure-jwt-secret-here
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   ```

### Usage

```sh
npm run dev       # Development mode (nodemon + gulp watch)
npm start         # Production mode
npm run seed      # Seed database with sample articles
npm run rss       # Ingest articles from RSS feeds
npm test          # Run tests
```

## Neutrality Scoring

Each article in The Signal has a **Neutrality Score** (0-100) that indicates how neutral the reporting is. A score of 100 is perfectly neutral; lower scores indicate more bias.

### How the Score Is Calculated

The algorithm in `system/utils/rssIngest.js` (`calculateNeutralityScore`) combines several factors:

| Factor | Impact |
|---|---|
| **Base score** | Starts at 90 for every article |
| **Source bias** | Left/Light bias: -15, Center/Right bias: -7, Unknown: 0 |
| **Charged language** | -2 per emotionally-loaded word found in content (e.g. "shocking", "scandal", "crisis") |

**Source bias** is stored per source in the database (e.g., BBC = center, NPR = left-center). This field is manually curated and can be updated via the admin panel.

**Example calculation:**
- Article from a "left-center" source (-7)
- Content contains one charged word (-2)
- **Final score: 90 - 7 - 2 = 81**

This score is displayed on article cards and detail pages to help readers quickly assess how neutral a given story's coverage is.

## Project Structure

```
the-signal/
├── server.js              # Entry point
├── app.js                 # Express app setup
├── config.env             # Environment variables
├── public/                # Frontend assets
│   ├── views/             # EJS templates
│   └── admin/             # Admin dashboard views
│   ├── css/scss/          # Sass source
│   ├── js/                # Client-side JS
│   └── img/               # Images
└── system/                # Backend
    ├── models/            # Mongoose models
    ├── controllers/       # Route controllers (articles, admin, search)
    ├── routes/            # API + view routes
    ├── utils/             # Utilities (apiFeatures, seedDB, rssIngest, etc.)
    └── tests/             # Mocha tests
```

## Admin Panel

Access the admin panel at `/admin/login`. The panel provides:

- Secure admin login with JWT-based authentication
- Dashboard with article statistics and neutrality scores
- Article CRUD operations (Create, Read, Update, Delete)
- Source and category management

## RSS Feed Ingestion

The `npm run rss` script fetches articles from configured RSS feeds and imports them into the database. Feeds are defined in `system/utils/rssIngest.js`.

## License

Distributed under the MIT License.

## Contact

Andy Kellock - a_kellock@hotmail.com

Project Link: [https://github.com/ASKK-1921/the-signal](https://github.com/ASKK-1921/the-signal)

<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/github/license/ASKK-1921/the-signal?style=for-the-badge
[license-url]: https://github.com/ASKK-1921/the-signal/blob/master/license.txt