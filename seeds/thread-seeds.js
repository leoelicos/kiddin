const { Thread } = require('../models');

const threadData = [
  {
    title: 'Buy and Sell Baby Stuff',
  },
  {
    title: 'Confessions: What Have I done to my baby?',
  },
  {
    title: 'Guess what my kid is mad about?',
  },
];

const seedThread = () => Thread.bulkCreate(threadData);

module.exports = seedThread;