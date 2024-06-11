const request = require('supertest');
const express = require('express');
const routes = require('../routes');

const app = express();
app.use('/api', routes);

describe('GET /api/matches', () => {
  it('should return a list of matches', async () => {
    const response = await request(app).get('/api/matches');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
