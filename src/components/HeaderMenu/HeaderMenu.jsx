import { Link } from 'react-router-dom';
import styles from './styles.module.css';

export default function Headermenu() {
  return (
    <ul className={ styles["header__menu"] }>
      <li className={ styles["header__menu-item"] }>
        <Link to="/" className={ styles["header__menu-link"] }>Home</Link>
      </li>
      <li className={ styles["header__menu-item"] }>
        <Link to="/formatador" className={ styles["header__menu-link"] }>Formatador de Dietas</Link>
      </li>
      <li className={ styles["header__menu-item"] }>
        <Link to="/ExamReader" className={ styles["header__menu-link"] }>Leitor de Exames</Link>
      </li>
    </ul>
  );
}