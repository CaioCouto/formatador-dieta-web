import styles from "./styles.module.css";
import { AddExamModal, ExamList, PatientList } from "./ExamReaderComponents";
import { useState } from "react";
import { useLocation } from "react-router-dom";

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

function returnContentToBeShown(pageLocation) {
  let result = optionButtons[0].label;

  if (pageLocation.state) {
    optionButtons.forEach(op => {
      op.active = false;
      if(op.label === pageLocation.state.contentTobeShown) {
        result = op.label;
        op.active = true;
      }
    });
  }

  return result;
}


export default function ExamReader() {
  const location = useLocation();
  const [ contentToBeShown, setContentToBeShown ] = useState(returnContentToBeShown(location)) 
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
              className={ `examreader__option ${option.active ? styles["examreader__option--active"] : ''}` }
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

