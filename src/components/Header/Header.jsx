import styles from './styles.module.css';
import logo from '../../assets/logo-only-rb.svg';
import HeaderMenu from '../HeaderMenu';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { ShowBackdropAtom } from '../../jotai';

function toggleMobileMenu(backdropElement, mobileMenuIsOpen, setMobileMenuIsOpen) {
  const mobileMenuClassList = backdropElement.classList;

  if(mobileMenuIsOpen) {
    mobileMenuClassList.remove(styles["header__menu-mobile-backdrop--show"]);
    setMobileMenuIsOpen(false);
  }
  else {
    mobileMenuClassList.add(styles["header__menu-mobile-backdrop--show"]);
    setMobileMenuIsOpen(true);
  }
}

export default function Header() {
  const [ showBackdrop, setShowBackdrop ] = useAtom(ShowBackdropAtom);
  const mobileMenuBackdroprRef = useRef(null);

  function handleMobileMenuIconClick(e) {
    toggleMobileMenu(
      mobileMenuBackdroprRef.current, 
      showBackdrop,
      setShowBackdrop
    );
  }

  function handleMobileMenuBackdropClick(e) {
    if(e.target !== mobileMenuBackdroprRef.current) { return; }

    toggleMobileMenu(
      mobileMenuBackdroprRef.current, 
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

      <section 
        className={ `${styles["header__menu-mobile-backdrop"]}` } 
        ref={ mobileMenuBackdroprRef } 
        onClick={ handleMobileMenuBackdropClick }
      >
        <div className={ `wrapper ${styles["header__menu-mobile-wrapper"]}` } >
          <HeaderMenu />
        </div>
      </section>

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