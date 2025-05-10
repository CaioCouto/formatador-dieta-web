import './App.css';
import {Footer, Header, UserReauthorizationModal } from './components';
import { 
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import {
  ContentList,
  ExamReaderExamForm,
  PatientReport,
  Formatter,
  PatientUpdateForm,
  Login,
  ExamList,
  PatientList
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
          <Route index element={ <ExamList /> }/>
          <Route exact path=":id" element={ <ExamReaderExamForm /> }/>
        </Route>
        <Route path="patients">
          <Route index element={ <PatientList /> }/>
          <Route exact path=":id" element={ <PatientReport /> }/>
          <Route exact path="edit/:id" element={ <PatientUpdateForm /> }/>
        </Route>
      </Routes>
      {
        blockedPaths.includes(pathname) ? null : <Footer/>
      }
    </>
  );
}