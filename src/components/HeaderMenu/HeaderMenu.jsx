import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import { useAtom } from 'jotai';
import { OpenMobileMenuAtom } from '../../jotai';

export default function Headermenu() {
  const [ openMobileMenu, setOpenMobileMenu ] = useAtom(OpenMobileMenuAtom);

  function handleLinkClick() {
    setOpenMobileMenu(false);
  }

  return (
    <ul className={ styles["header__menu"] }>
      <li className={ styles["header__menu-item"] }>
        <Link to="/" className={ styles["header__menu-link"] } onClick={ handleLinkClick }>Home</Link>
      </li>
      <li className={ styles["header__menu-item"] }>
        <Link to="/formatador" className={ styles["header__menu-link"] } onClick={ handleLinkClick }>Formatador de Dietas</Link>
      </li>
      <li className={ styles["header__menu-item"] }>
        <Link to="/exams/list" className={ styles["header__menu-link"] } onClick={ handleLinkClick }>Leitor de Exames</Link>
      </li>
    </ul>
  );
}