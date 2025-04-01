import styles from "./styles.module.css";
import { AddExamModal, ExamList, PatientList } from "./ExamReaderComponents";
import { useState } from "react";

const optionButtons = [
  { 
    label: 'Exames', 
    active: true
  },
  { 
    label: 'Pacientes', 
    active: false 
  }
]

export default function ExamReader() {
  const [ contentToBeShown, setContentToBeShown ] = useState(optionButtons[0].label) 
  function handleAddExamClick(index) {    
    document.querySelectorAll('.examreader__option').forEach((option, optIndex) => {
      const optionClasslisst = option.classList;
      optionClasslisst.remove(styles["examreader__option--active"]);
      if (optIndex === index) {
        optionClasslisst.add(styles["examreader__option--active"]);
      }
    });
    setContentToBeShown(optionButtons[index].label);
  }

  return (
    <main className={ `wrapper ${styles["examreader"]}` }>
      <h1 className={ styles["examreader__title"] }>Leitor de Exames</h1>

      <section className={ styles["examreader__content-wrapper"] }>
        <aside className={ styles["examreader__options"] }>
          {
            optionButtons.map((option, index) => (
              <button 
              key={ index } 
              onClick={ () => handleAddExamClick(index) } 
              data-label={ option.label }
              className={ `examreader__option ${index === 0 ? styles["examreader__option--active"] : ''}` }
            >
              { option.label }
            </button>
            ))
          }
        </aside>

        <div className={ styles["examreader__content"] }>
          {
            contentToBeShown === 'Exames' ?
            <ExamList />
            : 
            <PatientList />
          }
        </div>
      </section>


      <AddExamModal />
    </main>
  );
}

