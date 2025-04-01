import styles from './styles.module.css';
import logo from '../../assets/logo-only-rb.svg';


export default function Footer() {

  return (
    <footer className={ `${styles['footer']}` }>
      <div className={ `wrapper ${styles['footer__content']}` }>
        <section className={ styles["footer__logo-wrapper"] }>
          <img src={ logo } alt="logo" className={ styles["footer__logo"] } />
        </section>

        <section className={ styles["footer__menu-wrapper"] }>
          Rosceli Brás
        </section>
      </div>
    </footer>
  );
}