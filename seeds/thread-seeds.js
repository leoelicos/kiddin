const { Thread } = require('../models');

const threadData = [
  {
    title: 'Marketplace: Buy and Sell Baby Stuff',
    img:'/images/baby-items.png'
  },
  {
    title: 'Confessions: What Have I done to my baby?',
    img:'/images/babySurprise.jpg'
  },
  {
    title: 'Guess what my kid is mad about?',
    img:'/images/angry-baby.jpg'
  },
];

const seedThread = () => Thread.bulkCreate(threadData);

module.exports = seedThread;