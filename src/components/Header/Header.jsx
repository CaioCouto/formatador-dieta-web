import styles from './styles.module.css';
import logo from '../../assets/logo-only-rb.svg';
import HeaderMenu from '../HeaderMenu';
import Backdrop from '../Backdrop';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { OpenMobileMenuAtom } from '../../jotai';


export default function Header() {
  const [ openMobileMenu, setOpenMobileMenu ] = useAtom(OpenMobileMenuAtom);
  const mobileMenuBackdroprRef = useRef(null);

  function handleMobileMenuIconClick(e) {
    setOpenMobileMenu(true);
  }

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

        <section className={ styles['header__menu-icon-wrapper'] } onClick={ handleMobileMenuIconClick }>
          <FaBars size={ 32 }/>
        </section>
      </div>
    </header>
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