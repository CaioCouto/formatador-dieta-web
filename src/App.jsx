import './App.css';
import {Footer, Header, UserReauthorizationModal } from './components';
import { 
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import {
  ExamReader,
  ExamReaderExamForm,
  PatientReport,
  Formatter,
  PatientUpdateForm,
  Login
} from './pages';
import { blockedPaths } from './utils';

export default function App() {
  const { pathname } = useLocation();


  return (
    <>
      {
        blockedPaths.includes(pathname) ? null : 
        <>
          <UserReauthorizationModal/>
          <Header/>
        </>
      }
      <Routes>
        <Route exact path="/" element={ <Login /> }/>
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
      {
        blockedPaths.includes(pathname) ? null : <Footer/>
      }
    </>
  );
}