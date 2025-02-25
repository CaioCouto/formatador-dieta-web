import styles from './styles.module.css';
import logo from '../../assets/logo-only-rb.svg';
import HeaderMenu from '../HeaderMenu';

export default function Header() {
  return (
    <header className={ `wrapper ${styles['header']}` }>
      <section className={ styles["header__logo-wrapper"] }>
        <img src={ logo } alt="logo" className={ styles["header__logo"] } />
      </section>

      <section className={ styles["header__menu-wrapper"] }>
        <HeaderMenu />
      </section>
    </header>
  );
}