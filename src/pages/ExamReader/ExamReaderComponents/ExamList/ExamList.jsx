import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ExamReaderAddExamAtom } from "../../../../jotai";
import { Alert, Backdrop, Loader } from "../../../../components";

import styles from './styles.module.css';
import { FaCheck, FaChevronDown, FaTrash, FaXmark } from "react-icons/fa6";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../../../utils";
import axios, { all } from "axios";
import { FaRegEdit } from "react-icons/fa";

function returnResultsIntervals(results, index) {

  if (index === 0) { return `< ${ results[index].valor }` }
  else if (index === results.length - 1) { return `≥ ${ results[index].valor }` }
  else {
    return `${ results[index - 1].valor } - ${ results[index].valor }`
  }
}

export default function ExamList() {
  const [ openAddExamModal, setOpenaddExamModal ] = useAtom(ExamReaderAddExamAtom);
  const [ loading, setLoading ] = useState(false);
  const [ exams, setExams ] = useState([]);

  async function getAllExams() {
    let allExams = await axios.get(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/`);
    console.log(allExams.data.exams);
    allExams = allExams.data.exams.map(exam => {
      let resultados = exam.resultados;
      const resultadosCopy = [...resultados];
      console.log(resultados);
      if (resultados.length === 2) {
        const lastPos = resultados.length - 1;
        resultados.splice(1, 0, {
          id: null,
          exame_id: resultados[lastPos].exame_id,
          valor: resultados[lastPos].valor,
          resultado: 'Ideal'
        });
      }
      return exam;
    });
    
    setExams(allExams);
  }

  function handleOpenAddExamModal(e) {
    setOpenaddExamModal(true);
  }

  useEffect(() => { getAllExams(); }, []);

  return (
    <section className={ styles["examlist"] }>
      <div  className={ styles["examlist__header"] }>
        <h2 className={ styles["examlist__title"] }>Exames</h2>

        <div className={ styles["examlist__options"] }>
          <button onClick={ handleOpenAddExamModal }>Adicionar Exame</button>
        </div>
      </div>

      <div className={ styles["examlist__exams-wrapper"] }>
        {
          exams.length === 0 ?
          <Loader /> :
          exams.map((exam, index) => (
            <div className={ styles["examlist__exam"] } key={ index }>
              <div className={ styles["examlist__exam-info"] }>
                <div className={ styles["examlist__exam-info-text"] }>
                  <p className={ styles["examlist__exam-name"] }>{ exam.nome }</p>
                  <p className={ styles["examlist__exam-description"] }> ({ exam.resultados.length } resultados)</p>
                </div>

                <div className={ styles["examlist__exam-options"] }>
                  <FaRegEdit 
                    size={ returnIconSizeByWindowSize() }
                    className={ styles["examlist__edit-icon"] }
                  />
                  <FaTrash 
                    size={ returnIconSizeByWindowSize() }
                    className={ styles["examlist__delete-icon"] }
                    // onClick={ onDelete }
                  />
                </div>
              </div>

              {
                exam.resultados.length === 0 ?
                <div className={ styles["examlist__exam-results"] }>
                  <p>Este exame ainda não possui resultados cadastrados.</p>
                </div> :
                <div className={ styles["examlist__exam-results"] }>
                  <table className={ styles["examlist__exam-table"] }>
                    <thead>
                      <tr>
                        <th>Valor</th>
                        <th>Classificação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        exam.resultados.map((result, index) => (
                          <tr key={ index }  className={ styles["examlist__exam-table-row"] }>
                            <td >
                              { returnResultsIntervals(exam.resultados, index) }
                            </td>
                            <td>{ result.resultado }</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          ))
        }
      </div>
    </section>
  );
}