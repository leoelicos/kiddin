const { Post } = require('../models');

const postData = [
  {
    title: 'Buy my baby\'s nappies',
    text: 'Half price, brand new, come and get it! 2 packs for only $35.00',
    image_url: 'https://www.bigw.com.au/medias/sys_master/images/images/h25/he8/16831808831518.jpg',
    price: 35.00,
    thread_id: 1,
    user_id: 1
  },
  {
    title: 'I ate my baby\'s candy',
    text: 'It was 3am. A dark, hot, hungry woman (me) went downstairs to raid the fridge but there was no food except my baby\'s candy. I\'m such a bad person.',
    image_url: 'https://sites.imsa.edu/acronym/files/2021/10/candy.jpg',
    thread_id: 2,
    user_id: 2
  },
  {
    title: 'You\'ll never get this one!',
    text: 'Clues: it\'s related to food',
    image_url: 'https://www.momtastic.com/assets/uploads/2016/03/angerharmsbabiesemotionally_sized-1280x720.jpg',
    thread_id: 3,
    user_id: 3
  }
];

const seedPosts = () => Post.bulkCreate(postData);

module.exports = seedPosts;
