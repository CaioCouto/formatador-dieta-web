import styles from './styles.module.css';
import { useState } from "react";
import { Alert, Loader } from '../../components';
import { User } from '../../classes';
import { showAlertComponent } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { ShowFooterAtom, ShowHeaderAtom } from '../../jotai';

const userController = new User();

export default function Login() {
  const navigate = useNavigate();
  const [ showHeader, setShowHeader ] = useAtom(ShowHeaderAtom);
  const [ showFooter, setShowFooter ] = useAtom(ShowFooterAtom);

  const [ loading, setLoading ] = useState(false);
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ alert, setAlert ] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  function handleEmailChange(e) {
    setEmail(e.target.value)
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value)
  }

  async function handleFormSubmit(e) {
    setLoading(true);
    e.preventDefault();

    const response = await userController.signin(email, password);
    setLoading(false);
    

    if(response.status !== 200) {
      return showAlertComponent(response.message, 'error', true, setAlert);
    }
    
    setShowHeader(true);
    setShowFooter(true);
    navigate('/exams/list', { replace: true });
    
  }

  return (
    <main className={ styles['login'] }>  
      <form className={ `wrapper ${styles['login__form']}` } onSubmit={ handleFormSubmit }>
        <h1 className={ styles['login__form-title'] }>Login</h1>

        <Alert message={ alert.message } type={ alert.type } show={ alert.show }/>
        
        <section className={ styles['login__form-section'] }>
          <label htmlFor="email" className={ styles['login__form-label'] }>Email</label>
          <input
            id="email"
            name="email"
            className={ styles['login__form-input'] } 
            type="email" 
            onChange={ handleEmailChange }
            autoComplete="true"
            required  
          />
        </section>
        
        <section className={ styles['login__form-section'] }>
          <label htmlFor="password" className={ styles['login__form-label'] }>Senha</label>
          <input 
            id="password"
            name="password"
            className={ styles['login__form-input'] } 
            type="password" 
            onChange={ handlePasswordChange }
            autoComplete="true"
            required
          />
        </section>

        <button className={ styles['login__form-button'] }>
          { loading ? <Loader /> : null }
          Entrar
        </button>
      </form>
    </main>
  );
}