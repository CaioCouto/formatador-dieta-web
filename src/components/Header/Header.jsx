import styles from './styles.module.css';
import logo from '../../assets/logo-only-rb.svg';
import HeaderMenu from '../HeaderMenu';
import Backdrop from '../Backdrop';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { OpenMobileMenuAtom } from '../../jotai';

function toggleMobileMenu(mobileMenuIsOpen, setMobileMenuIsOpen) {
  setMobileMenuIsOpen(!mobileMenuIsOpen);
}

export default function Header() {
  const [ openMobileMenu, setOpenMobileMenu ] = useAtom(OpenMobileMenuAtom);
  const mobileMenuBackdroprRef = useRef(null);

  function handleMobileMenuIconClick(e) {
    toggleMobileMenu(
      openMobileMenu,
      setOpenMobileMenu
    );
  }

  return (
    <header className={ `wrapper ${styles['header']}` }>
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
        {
          !openMobileMenu ?
          <FaBars size={ 32 }/> :
          <FaXmark size={ 32 }/>
        }
      </section>
    </header>
  );
}

function MobileMenu({ mobileMenuBackdroprRef }) {
  const [ openMobileMenu, setOpenMobileMenu ] = useAtom(OpenMobileMenuAtom);

  function handleMobileMenuBackdropClick(e) {
    if(e.target !== mobileMenuBackdroprRef.current) { return; }

    toggleMobileMenu(
      openMobileMenu,
      setOpenMobileMenu
    );
  }

  function setShowClass(el) {
    if (!openMobileMenu) { 
      return ''; 
    }
    if (el === 'backdrop') {
      return styles["header__menu-mobile-backdrop--show"];
    }
    else if (el === 'menu-wrapper') {
      return styles["header__menu-mobile-wrapper--show"];
    }
  }

  return (
    <>
      <Backdrop
        className={ `${styles["header__menu-mobile-backdrop"]} ${ setShowClass('backdrop') }` } 
        ref={ mobileMenuBackdroprRef } 
        onClick={ handleMobileMenuBackdropClick }
      />

      <div className={ `wrapper ${styles["header__menu-mobile-wrapper"]} ${ setShowClass('menu-wrapper') }` } >
        <HeaderMenu />
      </div>
    </>
  );
}