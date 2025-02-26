import styles from './styles.module.css';
import logo from '../../assets/logo-only-rb.svg';
import HeaderMenu from '../HeaderMenu';
import Backdrop from '../Backdrop';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { ShowBackdropAtom } from '../../jotai';

function toggleMobileMenu(mobileMenuIsOpen, setMobileMenuIsOpen) {
  setMobileMenuIsOpen(!mobileMenuIsOpen);
}

export default function Header() {
  const [ showBackdrop, setShowBackdrop ] = useAtom(ShowBackdropAtom);
  const mobileMenuBackdroprRef = useRef(null);

  function handleMobileMenuIconClick(e) {
    toggleMobileMenu(
      showBackdrop,
      setShowBackdrop
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
        showBackdrop={ showBackdrop }
        setShowBackdrop={ setShowBackdrop } 
        mobileMenuBackdroprRef={ mobileMenuBackdroprRef }
      />      

      <section className={ styles['header__menu-icon-wrapper'] } onClick={ handleMobileMenuIconClick }>
        {
          !showBackdrop ?
          <FaBars size={ 32 }/> :
          <FaXmark size={ 32 }/>
        }
      </section>
    </header>
  );
}

function MobileMenu({ showBackdrop, setShowBackdrop, mobileMenuBackdroprRef }) {

  function handleMobileMenuBackdropClick(e) {
    if(e.target !== mobileMenuBackdroprRef.current) { return; }

    toggleMobileMenu(
      showBackdrop,
      setShowBackdrop
    );
  }

  function setShowClass(el) {
    if (!showBackdrop) { 
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