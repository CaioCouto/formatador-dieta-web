import './App.css';
import { Header } from './components';
import { 
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { Formatter, Home } from './pages';
import { atom, Provider } from 'jotai';

export default function App() {
  return (
    <>
      <Router>
        <Provider>
          <Header/>
          <Routes>
            <Route exact path="/" element={ <Home /> }/>
            <Route exact path="/formatador" element={ <Formatter /> }/>
          </Routes>
        </Provider>
      </Router>
    </>
  );
}