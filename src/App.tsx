import React from 'react';
import logo from './logo.svg';
import { useRoutes,  } from 'react-router-dom';
import routes from './routes';
import './App.css';

function App() {
  const element = useRoutes(routes);
  // const location = useLocation();

  // const navigationType = useNavigationType();

  // useLayoutEffect(() => {
  //   pushHistoryUrl(location, navigationType);
  // }, [location, location.pathname, navigationType]);

  return element;
}
export default App;
