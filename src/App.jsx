import { useRef, useState } from 'react';
import './App.css';
import axios from 'axios';
import { Header, SidebarMenu } from './components';
import { 
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { Formatter, Home } from './pages';

export default function App() {
  return (
    <>
      <Router>
        <Header/>
        <Routes>
          <Route exact path="/" element={ <Home /> }/>
          <Route exact path="/formatador" element={ <Formatter /> }/>
        </Routes>
      </Router>
    </>
  );
}