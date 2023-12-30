const express = require('express');
const bodyParser = require('body-parser');
const cluster = require('cluster');
const os = require('os');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

// Factory function for creating users
function createUser(username, age, hobbies) {
  return {
    id: uuidv4(),
    username: username,
    age: age,
    hobbies: hobbies || [],
  };
}

// In-memory database
const database = {
  users: [],
  addUser: (user) => database.users.push(user),
  getUserById: (userId) => database.users.find(user => user.id === userId),
  updateUser: (userId, updatedUser) => {
    const index = database.users.findIndex(user => user.id === userId);
    if (index !== -1) {
      database.users[index] = { ...database.users[index], ...updatedUser };
      return database.users[index];
    }
    return null;
  },
  deleteUser: (userId) => {
    const index = database.users.findIndex(user => user.id === userId);
    if (index !== -1) {
      database.users.splice(index, 1);
      return true;
    }
    return false;
  }
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON body
app.use(express.json());

// Middleware for input validation
const validateUserInput = [
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('age').isInt({ min: 1 }).withMessage('Age must be a positive integer'),
  // Add more validation rules for hobbies if needed
];

// Middleware for logging
app.use(morgan('combined'));

// Swagger setup
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRUD API',
      version: '1.0.0',
      description: 'A simple CRUD API with Express',
    },
  },
  apis: ['./app.js'], // Path to the API routes file
};

const specs = swaggerJsdoc(options);

// Middleware for Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// GET all users
app.get('/api/users', (req, res) => {
  res.status(200).json(database.users);
});

// GET user by ID
app.get('/api/users/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = database.getUserById(userId);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// POST new user
app.post('/api/users', validateUserInput, (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, age, hobbies } = req.body;
  const newUser = createUser(username, age, hobbies);
  database.addUser(newUser);

  res.status(201).json(newUser);
});

// PUT update user
app.put('/api/users/:userId', validateUserInput, (req, res) => {
  const userId = req.params.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const updatedUser = req.body;
  const user = database.updateUser(userId, updatedUser);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// DELETE user
app.delete('/api/users/:userId', (req, res) => {
  const userId = req.params.userId;
  const deleted = database.deleteUser(userId);

  if (deleted) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Cluster setup
if (cluster.isMaster) {
  const numCPUs = os.cpus().length - 1;

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Worker ${cluster.worker.id} is running on port ${PORT}`);
  });
}
