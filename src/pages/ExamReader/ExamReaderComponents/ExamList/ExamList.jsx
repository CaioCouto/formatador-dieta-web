import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { ConfirmationModalAtom, ExamReaderAddExamAtom } from "../../../../jotai";
import { Alert, ConfirmationModal, Loader, RefereceTable } from "../../../../components";

import styles from './styles.module.css';
import { FaTrash } from "react-icons/fa6";
import { returnIconSizeByWindowSize } from "../../../../utils";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import AddExamModal from "../AddExamModal/AddExamModal";

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
    setLoading(true);
    try {
      let allExams = await axios.get(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/`);
      allExams = allExams.data.exams.map(exam => {
        const resultados_grouped_by_gender = {};
        let resultados = exam.resultados;
        if (resultados.length === 2) {
          const lastPos = resultados.length - 1;
          resultados.splice(1, 0, {
            id: null,
            exame_id: resultados[lastPos].exame_id,
            valor: resultados[lastPos].valor,
            resultado: 'Ideal',
            sexo: resultados[lastPos].sexo
          });
        }

        resultados.forEach(resultado => {
          if(resultados_grouped_by_gender[resultado.sexo]) {
            resultados_grouped_by_gender[resultado.sexo].push(resultado);
          }
          else {
            resultados_grouped_by_gender[resultado.sexo] = [resultado];
          }
        });

        exam['resultados_grouped_by_gender'] = resultados_grouped_by_gender;

        return exam;
      });
      setExams(allExams);
    } catch (error) {
      if(error.name === 'AxiosError') {
        if(error.response.status === 404) {
          setExams([]);
        }
      }
    }
    finally {
      setLoading(false);
    } 
  }

  function handleOpenAddExamModal(e) {
    setOpenaddExamModal(true);
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
      <ConfirmationModal
        message={ confirmationModal.message }
        onConfirm={ deleteExam }
      />
      <AddExamModal /> 


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
          loading ?
          <Loader /> :
          <List 
            exams={ exams } 
            setExamIdToBeDeleted={ setExamIdToBeDeleted }
          />
        }
      </div>
    </section>
  );
}

function List({ exams, setExamIdToBeDeleted }) {
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  

  async function openDeleteConfirmationModal(examId) {
    setExamIdToBeDeleted(examId);
    setConfirmationModal({
      show: true,
      message: 'Tem certeza que deseja deletar este exame?',
    });
  }

  return (
    <>
      {
        exams.length === 0 ?
        <p className={ styles["examlist__no-exams"] }>Nenhum exame cadastrado</p> :
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
              <div className={ styles["examlist__exam-results"] }>
                <RefereceTable
                  results={ exam.resultados }
                  unit={ exam.unidade }
                  tableClassName={ styles["examlist__exam-table"] }
                  tableRowClassName={ styles["examlist__exam-table-row"]}
                  tableDataClassName={ styles["examlist__exam-table-data"]}
                />
              </div>
            }
          </div>
        ))
    }
    </>
  )
}