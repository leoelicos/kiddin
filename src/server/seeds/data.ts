export const threads = [
  { title: 'Marketplace: Buy and Sell Baby Stuff', img: '/images/baby-items.webp' },
  { title: 'Confessions: What Have I done to my baby?', img: '/images/babySurprise.webp' },
  { title: 'Guess what my kid is mad about?', img: '/images/angry-baby.webp' },
];

// Demo accounts (unchanged from v1). Never reuse these passwords anywhere real.
export const users = [
  { username: 'Jess', email: 'jess@jess.com', password: 'jessiscool' },
  { username: 'Leo', email: 'leo@leo.com', password: 'leoiscool' },
  { username: 'Ali', email: 'ali@ali.com', password: 'aliiscool' },
];

const THREAD_MARKETPLACE = 1;
const THREAD_CONFESSIONS = 2;
const THREAD_GUESSMYKID = 3;
const USER_JESS = 1;
const USER_LEO = 2;
const USER_ALICIA = 3;

export const posts = [
  {
    title: "Buy my baby's nappies",
    text: 'Half price, brand new, come and get it! 2 packs for only $35.00',
    image_url: '/images/seeds/babynappies.webp',
    image_alt: 'Two unopened packs of baby nappies',
    price: 35,
    thread_id: THREAD_MARKETPLACE,
    user_id: USER_JESS,
  },
  {
    title: 'Balance Bike',
    text: 'Balance bike big fun for any baby from 2 years old',
    image_url: '/images/seeds/balancebike.webp',
    image_alt: 'A small wooden balance bike leaning against a wall',
    price: 30,
    thread_id: THREAD_MARKETPLACE,
    user_id: USER_ALICIA,
  },
  {
    title: '3 baby bottles',
    text: 'Never used',
    image_url: '/images/seeds/babybottles.webp',
    image_alt: 'Three clean baby bottles standing in a row',
    price: 15,
    thread_id: THREAD_MARKETPLACE,
    user_id: USER_ALICIA,
  },
  {
    title: "I ate my baby's candy",
    text: "It was 3am. I went downstairs to raid the fridge but there was no food except my baby's candy. I'm such a bad person.",
    image_url: '/images/seeds/candy.webp',
    image_alt: 'A pile of colourful lollies',
    price: null,
    thread_id: THREAD_CONFESSIONS,
    user_id: USER_LEO,
  },
  {
    title: 'So last night...',
    text: "I pretended to be asleep so my baby would fall asleep too. I'm so bad!",
    image_url: '/images/seeds/pretendsleep.webp',
    image_alt: 'A parent lying in bed with eyes shut next to a baby',
    price: null,
    thread_id: THREAD_CONFESSIONS,
    user_id: USER_ALICIA,
  },
  {
    title: 'I yelled at my kid',
    text: "I couldn't control myself...",
    image_url: '/images/seeds/confessionangry.webp',
    image_alt: 'A frustrated parent holding their head in their hands',
    price: null,
    thread_id: THREAD_CONFESSIONS,
    user_id: USER_ALICIA,
  },
  {
    title: "You'll never get this one!",
    text: "Clues: it's related to food",
    image_url: '/images/seeds/cryingbaby.webp',
    image_alt: 'A baby crying with a scrunched-up face',
    price: null,
    thread_id: THREAD_GUESSMYKID,
    user_id: USER_JESS,
  },
  {
    title: 'Baby after a feed',
    text: 'What am I doing wrong?',
    image_url: '/images/seeds/angrybaby.webp',
    image_alt: 'A red-faced baby looking very unimpressed',
    price: null,
    thread_id: THREAD_GUESSMYKID,
    user_id: USER_JESS,
  },
];
