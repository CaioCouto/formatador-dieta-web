import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { ConfirmationModalAtom, ExamReaderAddPatientAtom } from "../../../../jotai";
import { Alert, ConfirmationModal, Loader } from "../../../../components";

import styles from './styles.module.css';
import { FaTrash } from "react-icons/fa6";
import { returnExamResultsIntervals, returnIconSizeByWindowSize } from "../../../../utils";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import AddPatientModal from "../AddPatientModal";

export default function PatientList() {
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ openAddPatientModal, setOpenAddPatientModal ] = useAtom(ExamReaderAddPatientAtom);
  const [ loading, setLoading ] = useState(false);
  const [ patients, setPatients ] = useState([]);
  const [ examIdToBeDeleted, setExamIdToBeDeleted ] = useState(null);
  const [ alert, setAlert ] = useState({
    message: 'test',
    type: 'success',
    show: false
  });

  async function getAllPatients() {
    try {
      setLoading(true);
      let allPatients = await axios.get(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/patients/`);
      console.log(allPatients.data.patients);
      // allPatients = allPatients.data.exams.map(exam => {
      //   let resultados = exam.resultados;
      //   if (resultados.length === 2) {
      //     const lastPos = resultados.length - 1;
      //     resultados.splice(1, 0, {
      //       id: null,
      //       exame_id: resultados[lastPos].exame_id,
      //       valor: resultados[lastPos].valor,
      //       resultado: 'Ideal'
      //     });
      //   }
      //   return exam;
      // });
      
      setPatients(allPatients.data.patients);
    } catch (error) {
      if(error.name === 'AxiosError') {
        const response = error.response;

        if(response.status === 404) {
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOpenAddPatientModal(e) {
    setOpenAddPatientModal(true);
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

  useEffect(() => { getAllPatients(); }, []);

  return (
    <section className={ styles["examlist"] }>
      <ConfirmationModal
        message={ confirmationModal.message }
        onConfirm={ deleteExam }
      />
      <AddPatientModal /> 


      <div  className={ styles["examlist__header"] }>
        <h2 className={ styles["examlist__title"] }>Pacientes</h2>

        <div className={ styles["examlist__options"] }>
          <button onClick={ handleOpenAddPatientModal }>Adicionar Paciente</button>
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
          <PatientsList allPatients={ patients } />
        }
      </div>
    </section>
  );
}

function PatientsList({ allPatients }) {
  return (
    <>
      {
        allPatients.length === 0 ?
        <p>Nenhum Paciente Cadastrado</p>
        :
        allPatients.map((exam, index) => (
          <div className={ styles["examlist__exam"] } key={ index }>
            <div className={ styles["examlist__exam-info"] }>
              <div className={ styles["examlist__exam-info-text"] }>
                <p className={ styles["examlist__exam-name"] }>{ exam.nome }</p>
                {/* <p className={ styles["examlist__exam-description"] }> ({ exam.resultados.length } resultados)</p>   */}
              </div>
  
              <div className={ styles["examlist__exam-options"] }>
                <Link to={ `/patients/${exam.id}` }>
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
  
            {/* {
              exam.resultados.length === 0 ?
              <div className={ styles["examlist__exam-results"] }>
                <p>Este exame ainda não possui resultados cadastrados.</p>
              </div> :
              <ReferenceTable results={ exam.resultados } />
            } */}
          </div>
        ))
      }
      
    </>
  )
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
              <tr key={ index } className={ styles["examlist__exam-table-row"] }>
                <td className={ styles["examlist__exam-table-data"] }>
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