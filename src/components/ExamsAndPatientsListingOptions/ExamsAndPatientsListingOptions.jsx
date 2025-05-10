import styles from "./styles.module.css";
import { Link, useLocation } from "react-router-dom";

const optionButtons = [
  { 
    label: 'Exames',
    path: 'exams'
  },
  { 
    label: 'Pacientes',
    path: 'patients'
  }
]


export default function ExamsAndPatientsListingOptions() {
  const { pathname } = useLocation();

  function setActiveClass(optionPath) {
    const isOptionLocation = pathname.split('/').pop() === optionPath;
    return isOptionLocation ? styles["options__option--active"] : '';
  }

  return (
    <section className={ styles["options__wrapper"] }>
        {
          optionButtons.map((option, index) => (
            <Link
            to={`/${option.path}`}
            key={ index }
            data-label={ option.label }
            className={ `${styles["options__option"]} ${setActiveClass(option.path)}` }
          >
            { option.label }
          </Link>
          ))
        }
    </section>
  );
}

