import './App.css';
import { Header } from './components';
import { 
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { ExamReader, Formatter, Home } from './pages';
import { Provider } from 'jotai';

export default function App() {
  return (
    <>
      <Router>
        <Provider>
          <Header/>
          <Routes>
            <Route exact path="/" element={ <Home /> }/>
            <Route exact path="/formatador" element={ <Formatter /> }/>
            <Route exact path="/examReader" element={ <ExamReader /> }/>
          </Routes>
        </Provider>
      </Router>
    </>
  );
}