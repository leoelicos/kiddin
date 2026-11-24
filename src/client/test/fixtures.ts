import type { PostDto, SessionInfo, ThreadDetail, ThreadSummary } from '../../shared/types.ts';

export const threads: ThreadSummary[] = [
  {
    id: 1,
    title: 'Marketplace: Buy and Sell Baby Stuff',
    img: '/i/1.webp',
    isMarketplace: true,
    postCount: 2,
  },
  {
    id: 2,
    title: 'Confessions: What Have I done to my baby?',
    img: '/i/2.webp',
    isMarketplace: false,
    postCount: 0,
  },
  {
    id: 3,
    title: 'Guess what my kid is mad about?',
    img: '/i/3.webp',
    isMarketplace: false,
    postCount: 1,
  },
];

const post = (over: Partial<PostDto>): PostDto => ({
  id: 1,
  title: 'Balance Bike',
  text: 'Big fun',
  image_url: '/i/bike.webp',
  image_alt: 'A wooden balance bike',
  price: 30,
  date: new Date().toISOString(),
  thread_id: 1,
  user_id: 2,
  user: { username: 'Leo' },
  thread: { title: threads[0]!.title },
  ...over,
});

export const marketplace: ThreadDetail = {
  thread: threads[0]!,
  isMarketplace: true,
  posts: [
    post({ id: 2 }),
    post({ id: 1, title: 'Nappies', user_id: 3, user: { username: 'Ali' }, image_alt: null }),
  ],
};

export const signedIn: SessionInfo = { loggedIn: true, user: { id: 2, username: 'Leo' } };
export const signedOut: SessionInfo = { loggedIn: false, user: null };
