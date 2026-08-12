const request = require('supertest');

// Mock the Ollama client so tests don't depend on a running Ollama instance
jest.mock('../src/ollamaClient', () => ({
  explainDiff: jest.fn().mockResolvedValue('Mocked explanation of the change.'),
}));

// Use an in-memory-ish throwaway DB file for tests
process.env.DB_PATH = ':memory:';

const app = require('../src/server');

describe('GET /api/health', () => {
  test('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/diff', () => {
  test('returns diff and explanation for valid input', async () => {
    const res = await request(app)
      .post('/api/diff')
      .send({ snippetA: 'let x = 1;', snippetB: 'let x = 2;', language: 'javascript' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('diff');
    expect(res.body).toHaveProperty('explanation');
    expect(Array.isArray(res.body.diff)).toBe(true);
  });

  test('rejects missing snippets with 400', async () => {
    const res = await request(app).post('/api/diff').send({ snippetA: 'only one' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/diffs', () => {
  test('returns an array of past diffs', async () => {
    const res = await request(app).get('/api/diffs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
