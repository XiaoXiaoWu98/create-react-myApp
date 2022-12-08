import { Navigate, RouteObject } from 'react-router-dom';
import Home from '../pages/home';
import Login from '../pages/login';
const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/login" replace={true} /> },
  {
    path: '/',
    element: <Home />,
    children: [

    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
];
export default routes;
