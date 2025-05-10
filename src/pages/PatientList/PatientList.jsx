import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ConfirmationModalAtom, ExamReaderAddPatientAtom } from "../../jotai";
import { Alert, ConfirmationModal, ExamsAndPatientsListingOptions, Loader } from "../../components";

import styles from './styles.module.css';
import { FaMagnifyingGlass, FaTrash } from "react-icons/fa6";
import { returnIconSizeByWindowSize, searchTermOnHTMLElement, showAlertComponent } from "../../utils";
import { useNavigate } from "react-router-dom";
import AddPatientModal from "./ExamListComponents/AddPatientModal";
import { Patients } from "../../classes";

const patientsController = new Patients();

export default function PatientList() {
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ openAddPatientModal, setOpenAddPatientModal ] = useAtom(ExamReaderAddPatientAtom);
  
  const searchBoxRef = useRef(null);
  const patientNameParagraphs = useRef([]);

  const [ loading, setLoading ] = useState(false);
  const [ patients, setPatients ] = useState([]);
  const [ patientIdToBeDeleted, setPatientIdToBeDeleted ] = useState(null);
  const [ alert, setAlert ] = useState({
    message: 'test',
    type: 'success',
    show: false
  });

  async function getAllPatients() {
    try {
      setLoading(true);
      const response = await patientsController.getAll();
      
      
      setPatients(response.data);
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

  async function deletePatient() {
    setLoading(true);
    setConfirmationModal({
      ...confirmationModal,
      show: false,
    });

    const targetPatientname = patients.filter(patient => patient.id === patientIdToBeDeleted)[0].nome;

    showAlertComponent(
      `Deletando paciente "${targetPatientname}"...`,
      'info',
      true,
      setAlert
    );

    const response = await patientsController.deletePatient(patientIdToBeDeleted);

    if(response.status !== 200) {
      showAlertComponent(
        response.message,
        'error',
        true,
        setAlert
      );
    }
    else {
      const newPatients = patients.filter((patient, i) => patient.id !== patientIdToBeDeleted);
      setPatients(newPatients);

      showAlertComponent(
        `Paciente "${targetPatientname}" deletado com sucesso!`,
        'success',
        true,
        setAlert
      );
    }
    
    setLoading(false);
  }

  useEffect(() => { getAllPatients(); }, []);

  return (
    <main className={ `wrapper ${styles["examlist"]}` }>
      <ConfirmationModal
        onConfirm={ deletePatient }
      />
      <AddPatientModal /> 

      <Alert 
        message={ alert.message }
        type={ alert.type }
        show={ alert.show }
      />

      <ExamsAndPatientsListingOptions />


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

      <div className={ styles["examlist__exams-wrapper"] }>
        {
          loading ?
          <Loader /> :
          <PatientsList 
            allPatients={ patients } 
            populatePatientNameParagraphsRefs={ populatePatientNameParagraphsRefs } 
            setPatientIdToBeDeleted={ setPatientIdToBeDeleted } 
          />
        }
      </div>
    </main>
  );
}

function PatientsList({ allPatients, populatePatientNameParagraphsRefs, setPatientIdToBeDeleted }) {
  const [ _, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const navigate = useNavigate();

  function navigateToPatientPage(patientId) {
    navigate(`/patients/${patientId}`, { replace: true });
  }

  function openDeleteConfirmationModal(examId) {
    setPatientIdToBeDeleted(examId);
    setConfirmationModal({
      show: true,
      message: 'Tem certeza que deseja deletar este Paciente?',
    });
  }

  return (
    <>
      {
        allPatients.length === 0 ?
        <p>Nenhum Paciente Cadastrado</p>
        :
        allPatients.map((patient, index) => (
          <div 
            ref={ populatePatientNameParagraphsRefs } 
            className={ styles["examlist__exam"] } 
            key={ index }
          >
            <div className={ styles["examlist__exam-info"] }>
              <div 
                className={ styles["examlist__exam-info-text"] }
                onClick={ () => navigateToPatientPage(patient.id) }
              >
                <p className={ `patientName ${styles["examlist__exam-name"]}` }>{ patient.nome }</p>
              </div>
  
              <div className={ styles["examlist__exam-options"] }>
                <FaTrash 
                  size={ returnIconSizeByWindowSize() }
                  className={ styles["examlist__delete-icon"] }
                  onClick={(e) => openDeleteConfirmationModal(patient.id) }
                />
              </div>
            </div>
          </div>
        ))
      }
      
    </>
  )
}