// database.js
const User = require('./user');

const users = [];

module.exports = {
  getUsers: () => users,
  getUserById: (userId) => users.find(user => user.id === userId),
  addUser: (user) => users.push(user),
  updateUser: (userId, updatedUser) => {
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      return users[index];
    }
    return null;
  },
  deleteUser: (userId) => {
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
      users.splice(index, 1);
      return true;
    }
    return false;
  }
};
