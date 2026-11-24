import { createBrowserRouter, type RouteObject } from 'react-router';
import { HomeRoute, homeLoader } from './routes/home.tsx';
import { LoginRoute, loginAction, loginLoader } from './routes/login.tsx';
import { logoutAction } from './routes/logout.ts';
import { NotFoundRoute, RouteError } from './routes/error.tsx';
import { BootScreen, RootLayout, rootLoader } from './routes/root.tsx';
import { ThreadRoute, threadAction, threadLoader } from './routes/thread.tsx';

export const routes: RouteObject[] = [
  {
    id: 'root',
    path: '/',
    loader: rootLoader,
    Component: RootLayout,
    HydrateFallback: BootScreen,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, loader: homeLoader, Component: HomeRoute },
          {
            path: 'thread/:id',
            loader: threadLoader,
            action: threadAction,
            Component: ThreadRoute,
          },
          { path: 'login', loader: loginLoader, action: loginAction, Component: LoginRoute },
          { path: 'logout', action: logoutAction },
          { path: '*', Component: NotFoundRoute },
        ],
      },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes);
