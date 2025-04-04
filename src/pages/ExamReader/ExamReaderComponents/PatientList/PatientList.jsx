import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ConfirmationModalAtom, ExamReaderAddPatientAtom } from "../../../../jotai";
import { Alert, ConfirmationModal, Loader } from "../../../../components";

import styles from './styles.module.css';
import { FaMagnifyingGlass, FaTrash } from "react-icons/fa6";
import { returnIconSizeByWindowSize, searchTermOnHTMLElement } from "../../../../utils";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import AddPatientModal from "../AddPatientModal";

export default function PatientList() {
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ openAddPatientModal, setOpenAddPatientModal ] = useAtom(ExamReaderAddPatientAtom);
  
  const searchBoxRef = useRef(null);
  const patientNameParagraphs = useRef([]);

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
  
  function populatePatientNameParagraphsRefs(el) {
    patientNameParagraphs.current.push(el)
  }
  
  function handleSearchTermChange(e) {
    patientNameParagraphs.current.forEach(el => {
      if (!el) { return; }
      const termExists = searchTermOnHTMLElement(e.target.value, el, 'patientName');
      el.style.display = termExists ? 'block' : 'none';
    });
  }

  function handleOpenSeachBox() {
    const searchBoxClasslist = searchBoxRef.current.classList;
    const openClass = styles['examlist__searchbox--open'];

    if(searchBoxClasslist.contains(openClass)) {
      searchBoxClasslist.remove(openClass);
    }
    else {
      searchBoxClasslist.add(openClass);
    }
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
          <button className={ styles["examlist__options-search"] } onClick={ handleOpenSeachBox }>
            <FaMagnifyingGlass size={ returnIconSizeByWindowSize() } />
          </button>
          <button onClick={ handleOpenAddPatientModal }>Adicionar Paciente</button>
        </div>
      </div>

      <div ref={ searchBoxRef } className={ styles["examlist__searchbox"] }>
        <input 
          type="text" 
          placeholder="Nome do Paciente..." 
          className={ styles["examlist__searchbox-input"] } 
          onChange={ handleSearchTermChange } 
        />
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
          <PatientsList 
            allPatients={ patients } 
            populatePatientNameParagraphsRefs={ populatePatientNameParagraphsRefs }  
          />
        }
      </div>
    </section>
  );
}

function PatientsList({ allPatients, populatePatientNameParagraphsRefs }) {
  return (
    <>
      {
        allPatients.length === 0 ?
        <p>Nenhum Paciente Cadastrado</p>
        :
        allPatients.map((exam, index) => (
          <div ref={ populatePatientNameParagraphsRefs } className={ styles["examlist__exam"] } key={ index }>
            <div className={ styles["examlist__exam-info"] }>
              <div className={ styles["examlist__exam-info-text"] }>
                <p className={ `patientName ${styles["examlist__exam-name"]}` }>{ exam.nome }</p>
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
          </div>
        ))
      }
      
    </>
  )
}