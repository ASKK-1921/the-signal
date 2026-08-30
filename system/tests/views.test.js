/* eslint-disable no-undef */
// eslint-disable-next-line node/no-unpublished-require
const supertest = require('supertest');
const assert = require('assert');

// Refers to PORT where program is runninng
const server = supertest.agent('localhost:3000');

describe('View Routes Test', () => {
	describe('Landing pages', () => {
		it('Should load the index page /', (done) => {
			server.get('/').end((err, res) => {
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual('text/html', res.type);
				done();
			});
		});
	});
});
