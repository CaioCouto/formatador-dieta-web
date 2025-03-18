import './App.css';
import { Header } from './components';
import { 
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { ExamReader, ExamReaderExamForm, Formatter, Home } from './pages';
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
            <Route path='exams'>
              <Route exact path="list" element={ <ExamReader /> }/>
              <Route exact path=":id" element={ <ExamReaderExamForm /> }/>
            </Route>
          </Routes>
        </Provider>
      </Router>
    </>
  );
}