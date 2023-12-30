// user.js
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(username, age, hobbies) {
    this.id = uuidv4();
    this.username = username;
    this.age = age;
    this.hobbies = hobbies || [];
  }
}

module.exports = User;
