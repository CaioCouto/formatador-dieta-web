import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import { useAtom } from 'jotai';
import { OpenMobileMenuAtom } from '../../jotai';
import { FaChevronDown } from 'react-icons/fa6';

export default function Headermenu() {
  const [ openMobileMenu, setOpenMobileMenu ] = useAtom(OpenMobileMenuAtom);

  function handleLinkClick() {
    setOpenMobileMenu(false);
  }

  return (
    <div className={ styles["header__menu-wrapper"] }>
      <ul className={ styles["header__menu"] }>
        <li className={ styles["header__menu-item"] }>
          <Link to="/" className={ styles["header__menu-link"] } onClick={ handleLinkClick }>Home</Link>
        </li>
        <li className={ styles["header__menu-item"] }>
          <Link to="/formatador" className={ styles["header__menu-link"] } onClick={ handleLinkClick }>Formatador de Dietas</Link>
        </li>
        <li className={ `${styles["header__menu-item"]} ${styles["header__menu-dropdown"]}` }>
          Listagem <FaChevronDown size={ 12 }/>
          <div className={ styles["header__dropdown-menu"] }>
            <Link to="/exams" className={ `${styles["header__menu-link"]} ${styles["header__dropdown-link"]}` } onClick={ handleLinkClick }>Exames</Link>
            <Link to="/patients" className={ `${styles["header__menu-link"]} ${styles["header__dropdown-link"]}` } onClick={ handleLinkClick }>Pacientes</Link>
          </div>
        </li>
      </ul>

      <p className={ styles["header__menu-user"] }>logout</p>
    </div>
  );
}