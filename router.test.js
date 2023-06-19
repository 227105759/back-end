const request = require('supertest');
const app = require('./routes');

describe('Test the cat API endpoints', () => {
  test('GET /cats should respond with JSON data and a 200 status code', async () => {
    const response = await request(app).get('/cats');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.any(Array));
  });

  test('POST /add-cat should add a new cat entry and respond with a 200 status code', async () => {
    const response = await request(app)
      .post('/add-cat')
      .field('title', 'Test Cat')
      .field('age', 2)
      .attach('images', './test/cat.jpg');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ success: true }));
  });

  test('PUT /cats/:id should update a cat entry and respond with a 200 status code', async () => {
    const response = await request(app)
      .put('/cats/123')
      .send({ title: 'Updated Cat', age: 3 });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ message: 'Cat entry updated successfully: 123' }));
  });

  test('DELETE /cats/:id should delete a cat entry and respond with a 200 status code', async () => {
    const response = await request(app).delete('/cats/123');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ message: 'Cat entry deleted successfully' }));
  });
});