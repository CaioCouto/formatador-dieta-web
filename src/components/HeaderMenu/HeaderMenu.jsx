import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import { useAtom } from 'jotai';
import { ShowBackdropAtom } from '../../jotai';

export default function Headermenu() {
  const [ showBackdrop, setShowBackdrop ] = useAtom(ShowBackdropAtom);

  function handleLinkClick() {
    setShowBackdrop(false);
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
        <Link to="/ExamReader" className={ styles["header__menu-link"] } onClick={ handleLinkClick }>Leitor de Exames</Link>
      </li>
    </ul>
  );
}