import './App.css';
import { Header } from './components';
import { 
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { Formatter, Home } from './pages';
import { ShowBackdropContext } from './context';
import { useState } from 'react';

export default function App() {
  const showBackDropContextValue = useState(false);

  return (
    <>
      <Router>
        <ShowBackdropContext.Provider value={ showBackDropContextValue }>
          <Header/>
          <Routes>
            <Route exact path="/" element={ <Home /> }/>
            <Route exact path="/formatador" element={ <Formatter /> }/>
          </Routes>
        </ShowBackdropContext.Provider>
      </Router>
    </>
  );
}