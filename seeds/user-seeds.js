const { User } = require('../models');

const userData = [
  {
   username:'Jess',
   email:'jess@jess.com',
   password:'jessiscool'
  },
  {
    username:'Leo',
    email:'leo@leo.com',
    password:'leoiscool'
   },
   {
    username:'Ali',
    email:'ali@ali.com',
    password:'aliiscool'
   }

];

const seedUser = () => User.bulkCreate(userData);

module.exports = seedUser;
