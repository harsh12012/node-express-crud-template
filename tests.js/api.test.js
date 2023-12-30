const request = require('supertest');
const app = require('./app');

test('GET /api/users', async () => {
  const response = await request(app).get('/api/users');
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveLength(0);
});

test('POST /api/users', async () => {
  const newUser = {
    username: 'john_doe',
    age: 30,
    hobbies: ['Reading', 'Coding'],
  };

  const response = await request(app).post('/api/users').send(newUser);
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty('id');
  expect(response.body.username).toBe(newUser.username);
  expect(response.body.age).toBe(newUser.age);
  expect(response.body.hobbies).toEqual(newUser.hobbies);
});

test('GET /api/users/:userId', async () => {
  // Assuming there's a user with ID '1' in the database
  const userId = '1';

  const response = await request(app).get(`/api/users/${userId}`);
  expect(response.statusCode).toBe(200);
  expect(response.body.id).toBe(userId);
  // Add more assertions based on your actual user data
});

test('PUT /api/users/:userId', async () => {
  // Assuming there's a user with ID '1' in the database
  const userId = '1';
  const updatedUser = {
    username: 'Harsh Sharma',
    age: 25,
    hobbies: ['Table Tennis', 'Coding', 'Cricket'],
  };

  const response = await request(app).put(`/api/users/${userId}`).send(updatedUser);
  expect(response.statusCode).toBe(200);
  expect(response.body.id).toBe(userId);
  expect(response.body.username).toBe(updatedUser.username);
  expect(response.body.age).toBe(updatedUser.age);
  expect(response.body.hobbies).toEqual(updatedUser.hobbies);
});

test('DELETE /api/users/:userId', async () => {
  // Assuming there's a user with ID '1' in the database
  const userId = '1';

  const response = await request(app).delete(`/api/users/${userId}`);
  expect(response.statusCode).toBe(204);

  // Confirm that the user is deleted
  const getUserResponse = await request(app).get(`/api/users/${userId}`);
  expect(getUserResponse.statusCode).toBe(404);
  // Add more assertions based on your expected behavior
});
