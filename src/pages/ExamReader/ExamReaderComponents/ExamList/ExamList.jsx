import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ConfirmationModalAtom, ExamReaderAddExamAtom } from "../../../../jotai";
import { Alert, Backdrop, ConfirmationModal, Loader } from "../../../../components";

import styles from './styles.module.css';
import { FaCheck, FaChevronDown, FaTrash, FaXmark } from "react-icons/fa6";
import { returnExamResultsIntervals, returnIconSizeByWindowSize, showAlertComponent } from "../../../../utils";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ExamList() {
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ openAddExamModal, setOpenaddExamModal ] = useAtom(ExamReaderAddExamAtom);
  const [ loading, setLoading ] = useState(false);
  const [ exams, setExams ] = useState([]);
  const [ examIdToBeDeleted, setExamIdToBeDeleted ] = useState(null);
  const [ alert, setAlert ] = useState({
    message: 'test',
    type: 'success',
    show: false
  });

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

  async function openDeleteConfirmationModal(examId) {
    setExamIdToBeDeleted(examId);
    setConfirmationModal({
      show: true,
      message: 'Tem certeza que deseja deletar este exame?',
    });
  }

  async function deleteExam() {
    try {
      setLoading(true);
      setConfirmationModal({
        ...confirmationModal,
        show: false,
      });

      setAlert({
        message: 'Deletando exame...',
        type: 'info',
        show: true
      });

      await axios.delete(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/${examIdToBeDeleted}`);
      
      const newExams = exams.filter((exam, i) => exam.id !== examIdToBeDeleted);
      setExams(newExams);

      setAlert({
        message: 'Exame Deletado com sucesso!',
        type: 'success',
        show: true
      });
    } catch (error) {
      let alertMessage = '';

      if(error.name === 'AxiosError') {
        alertMessage = error.response.data.message;
        console.log(error.response)
      }

      alertMessage = error.message;
      
      setAlert({
        message: alertMessage,
        type: 'error',
        show: true
      });  
      
    } finally {
      setLoading(false);

      setTimeout(() => {
        setAlert({
          ...alert,
          show: false
        });
      }, 5000);
    }
  }

  useEffect(() => { getAllExams(); }, []);

  return (
    <section className={ styles["examlist"] }>
      {
        !confirmationModal.show ?
        null:
        <ConfirmationModal
          message={ confirmationModal.message }
          onConfirm={ deleteExam }
        />
      }

      <div  className={ styles["examlist__header"] }>
        
        <h2 className={ styles["examlist__title"] }>Exames</h2>

        <div className={ styles["examlist__options"] }>
          <button onClick={ handleOpenAddExamModal }>Adicionar Exame</button>
        </div>
      </div>

      <Alert 
        message={ alert.message }
        type={ alert.type }
        show={ alert.show }
      />

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
                  <Link to={ `/exams/${exam.id}` }>
                    <FaRegEdit 
                      size={ returnIconSizeByWindowSize() }
                      className={ styles["examlist__edit-icon"] }
                    />
                  </Link>
                  <FaTrash 
                    size={ returnIconSizeByWindowSize() }
                    className={ styles["examlist__delete-icon"] }
                    onClick={(e) => openDeleteConfirmationModal(exam.id) }
                  />
                </div>
              </div>

              {
                exam.resultados.length === 0 ?
                <div className={ styles["examlist__exam-results"] }>
                  <p>Este exame ainda não possui resultados cadastrados.</p>
                </div> :
                <ReferenceTable results={ exam.resultados } />
              }
            </div>
          ))
        }
      </div>
    </section>
  );
}

function ReferenceTable({ results }) {
  return (
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
            results.map((result, index) => (
              <tr key={ index }  className={ styles["examlist__exam-table-row"] }>
                <td >
                  { returnExamResultsIntervals(results, index) }
                </td>
                <td>{ result.resultado }</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}