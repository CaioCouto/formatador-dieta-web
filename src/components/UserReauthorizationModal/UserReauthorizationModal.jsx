import styles from './styles.module.css';
import { FaXmark } from 'react-icons/fa6';
import { useAtom } from 'jotai';
import { IconSizeAtom, OpenUserAuthenticationModalAtom } from '../../jotai';
import { processQueue, returnIconSizeByWindowSize, setRefreshing, showAlertComponent } from '../../utils';
import { useEffect, useRef, useState } from 'react';
import Backdrop from '../Backdrop';
import { useNavigate } from 'react-router-dom';
import { User } from '../../classes';
import Alert from '../Alert';
import Loader from '../Loader';

const userController = new User();

export default function UserReauthorizationModal() {
  const navigate = useNavigate();
  const confirmButtonRef = useRef(null);
  const [ openUserAuthenticationModalModal, setOpenUserAuthenticationModalModal ] = useAtom(OpenUserAuthenticationModalAtom);
  const [ iconSize, setIconSize ] = useAtom(IconSizeAtom);

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState(''); 
  const [ loading, setLoading ] = useState(false); 
  const [ alert, setAlert ] = useState({ 
    show: false, 
    message: '', 
    type: 'success' 
  });

  function returnShowClass() {
    if (openUserAuthenticationModalModal) {
      return styles['modal--show'];
    }
  }

  function redirectToLogin() {
    window.dispatchEvent(new CustomEvent('user-auth-cancelled'));
    setOpenUserAuthenticationModalModal(false);
    navigate('/login', { replace: true });
  } 

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  async function handleFormSubmit(e) {
    setLoading(true);
    e.preventDefault();

    const response = await userController.signin(email, password);

    if(response.status !== 200) {
      return showAlertComponent(response.message, 'error', true, setAlert);
    }

    setEmail('');
    setPassword('');
    setLoading(false);
    setRefreshing(false);
    processQueue(null, true);
    setOpenUserAuthenticationModalModal(false);
  }

  useEffect(() => {
    window.addEventListener('resize', () => {
      setIconSize(returnIconSizeByWindowSize());
    })
  }, []);

  return (
    <>
      {
        openUserAuthenticationModalModal ?
        <Backdrop/>
        : null
      }

      <div className={ `${styles['modal']} ${ returnShowClass() }` }>
        <div className={ styles['modal__header']}>
          <h2 className={ styles['modal__title'] }>Autenticação necessária</h2>
        </div>

        <Alert
          show={ alert.show } 
          message={ alert.message } 
          type={ alert.type }
        />

        <div className={ styles['modal__body']}>
          <p className={ styles['modal__message'] }>
            Parece que a sua sessão expirou. <br/>
            Por favor, faca login novamente para continuar.
          </p>

          <form className={ styles['modal__form'] } onSubmit={ handleFormSubmit }>
            <section className={ styles['modal__form-section'] }>
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                className={ styles['modal__form-input'] }
                onChange={ handleEmailChange }
                autoComplete='true'
                required
              />
            </section>

            <section className={ styles['modal__form-section'] }>
              <label htmlFor="password">Senha</label>
              <input 
                type="password" 
                name="password" 
                id="password" 
                className={ styles['modal__form-input'] }
                onChange={ handlePasswordChange }
                autoComplete='true'
                required
              />
            </section>

            
            {
              loading ?
              <Loader />
              : 
              <section className={ styles['modal__form-actions'] }>
                <button 
                  type="button" 
                  className={ `${styles["modal__form-button"]} ${styles['modal__cancel']}` }
                  onClick={ redirectToLogin }
                >
                  Cancelar
                </button>

                <button 
                  type="submit" 
                  className={ `${styles["modal__form-button"]} ${styles['modal__confirm']}` }
                >
                  Confirmar
                </button>
              </section>
            }

            
          </form>
        </div>
      </div>
    </>
  );
}