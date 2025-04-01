import './App.css';
import { Header } from './components';
import { 
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import {
  ExamReader,
  ExamReaderExamForm,
  PatientReport,
  Formatter,
  Home,
  PatientUpdateForm
} from './pages';
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
            <Route path="exams">
              <Route exact path="list" element={ <ExamReader /> }/>
              <Route exact path=":id" element={ <ExamReaderExamForm /> }/>
            </Route>
            <Route path="patients">
              <Route exact path="edit/:id" element={ <PatientUpdateForm /> }/>
              <Route exact path=":id" element={ <PatientReport /> }/>
            </Route>
          </Routes>
        </Provider>
      </Router>
    </>
  );
}