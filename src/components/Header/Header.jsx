import styles from './styles.module.css';
import logo from '../../assets/logo-only-rb.svg';
import HeaderMenu from '../HeaderMenu';
import Backdrop from '../Backdrop';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { OpenMobileMenuAtom, ShowHeaderAtom } from '../../jotai';
import { User } from '../../classes';
import { useNavigate } from 'react-router-dom';

const userController = new User();

export default function Header() {
  const [ showHeader, setShowHeader ] = useAtom(ShowHeaderAtom);
  const [ openMobileMenu, setOpenMobileMenu ] = useAtom(OpenMobileMenuAtom);
  const mobileMenuBackdroprRef = useRef(null);

  function handleMobileMenuIconClick(e) {
    setOpenMobileMenu(true);
  }
  
  if(!showHeader) { return null; }
  return (
    <header className={ `${styles['header']}` }>
      <div className={ `wrapper ${styles['header__content']}` }>
        <section className={ styles["header__logo-wrapper"] }>
          <img src={ logo } alt="logo" className={ styles["header__logo"] } />
        </section>

        <section className={ styles["header__menu-wrapper"] }>
          <HeaderMenu />
        </section>

        <MobileMenu
          openMobileMenu={ openMobileMenu }
          setOpenMobileMenu={ setOpenMobileMenu } 
          mobileMenuBackdroprRef={ mobileMenuBackdroprRef }
        />

        <UserSection/>

        <section className={ styles['header__menu-icon-wrapper'] } onClick={ handleMobileMenuIconClick }>
          <FaBars size={ 32 }/>
        </section>
      </div>
    </header>
  );
}

function UserSection () {
  const navigate = useNavigate();

  async function handleSignOutClick() {
    await userController.signOut();
    navigate('/login', { replace: true });
  }

  return (
    <section className={ styles['header__menu-user'] }>
      <p onClick={ handleSignOutClick } style={{ cursor: 'pointer' }}>Logout</p>
    </section>
  );
}

function MobileMenu() {
  const [ openMobileMenu, setOpenMobileMenu ] = useAtom(OpenMobileMenuAtom);

  function handleMobileMenuBackdropClick() {
    setOpenMobileMenu(false);
  }

  function setShowClass() {
    if(openMobileMenu) { 
      return styles["header__menu-mobile-wrapper--show"]; 
    }
  }

  return (
    <>
      {
        openMobileMenu ?
        <Backdrop onClick={ handleMobileMenuBackdropClick }/>
        : null
      }

      <div className={ `${styles["header__menu-mobile-wrapper"]} ${ setShowClass('menu-wrapper') }` } >
        <div className={ `wrapper ${styles["header__menu-mobile-header"]}` }>
          <img src={ logo } alt="logo" className={ styles["header__menu-mobile-logo"] } />

          <div className={ styles["header__menu-mobile-icon-wrapper"] } onClick={ handleMobileMenuBackdropClick }>
            <FaXmark size={ 32 }/>
          </div>
          
        </div>
        <HeaderMenu />
      </div>
    </>
  );
}