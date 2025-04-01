import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { AddPatientResultModalAtom } from "../../../../jotai";
import { Alert, Backdrop, Loader } from "../../../../components";

import styles from './styles.module.css';
import { FaCheck, FaXmark } from "react-icons/fa6";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../../../utils";
import axios from "axios";

function returnShowClass(openAddPatientResultModal) {
  if(openAddPatientResultModal) {
    return styles["modal--show"];
  }
}

export default function AddPatientResultModal({ pacienteId }) {
  const formRef = useRef(null);
  const [ openAddPatientResultModal, setOpenAddPatientResultModal ] = useAtom(AddPatientResultModalAtom);
  
  const [ loading, setLoading ] = useState(false);
  const [ allExams, setAllExams ] = useState([]);
  const [ selectedExam, setSelectedExam ] = useState(0);
  const [ selectedExamDate, setSelectedExamDate ] = useState('');
  const [ selectedExamResult, setSelectedExamResult ] = useState(0);
  
  const [ showHelperText, setShowHelperText ] = useState({
    selectedExam: { show: false, message: '' },
    selectedExamDate: { show: false, message: '' },
    selectedExamResult: { show: false, message: '' },
  });
  const [ alert, setAlert ] = useState({
    message: 'teste',
    type: 'success',
    show: false
  });

  async function loadAllExams() {
    let allExams = await axios.get(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/`);
    setAllExams(allExams.data.exams);
  } 

  useEffect(() => { 
    if(openAddPatientResultModal) {
      if (allExams.length === 0) { loadAllExams(); }
      setAlert({ ...alert, show: false });
      setSelectedExam(0);
      setSelectedExamDate('');
      setSelectedExamResult(0);
      formRef.current.reset();
    }
  }, [openAddPatientResultModal]);

  function handleCloseIconClick(e) {
    setOpenAddPatientResultModal(false);
  }

  function handleExamChange(e) {
    const value = Number(e.target.value);
    let helperTextShow = false;
    let helperTextMessage = '';

    if(value) {
      setSelectedExam(Number(e.target.value));
    }
    else {
      helperTextShow = true;
      helperTextMessage = 'Um exame deve ser selecionado.'
    }

    setShowHelperText({
      ...showHelperText,
      selectedExam: {
        show: helperTextShow,
        message: helperTextMessage,
      }
    });
  }

  function handleExamDateChange(e) {
    const today = new Date().toISOString().split('T')[0];
    const value = e.target.value;
    let helperTextShow = false;
    let helperTextMessage = '';

    if(value <= today) {
      setSelectedExamDate(value);
    }
    else {
      helperTextShow = true;
      helperTextMessage = 'A data do exame deve ser menor ou igual a data atual.'
    }

    setShowHelperText({
      ...showHelperText,
      selectedExamDate: {
        message: helperTextMessage,
        show: helperTextShow
      }
    });
  }

  function handleSelectedExamResultChange(e) {
    const value = Number(e.target.value.replace(/[,.]/g, '.'));
    let helperTextShow = false;
    let helperTextMessage = '';
    
    if(!isNaN(value)) {
      setSelectedExamResult(value);
    }
    else {
      helperTextShow = true;
      helperTextMessage = 'O resultado deve conter apenas números.'
    }
    
    setShowHelperText({
      ...showHelperText,
      selectedExamResult: {
        show: helperTextShow,
        message: helperTextMessage,
      }
    });
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (!selectedExam || !selectedExamDate || !selectedExamResult) {
      return setShowHelperText({
        selectedExam: {
          show: !selectedExam,
          message: 'Um exame deve ser selecionado.'
        },
        selectedExamDate: {
          show: !selectedExamDate,
          message: 'A data do exame deve ser selecionada.'
        },
        selectedExamResult: {
          show: !selectedExamResult,
          message: 'O resultado do exame deve ser preenchido.'
        },
      });
    }

    try {
      setLoading(true);

      showAlertComponent(
        'Salvando Resultado...',
        'info',
        true,
        setAlert
      );

      await axios.post(
        `${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/patient-results/`, 
        { 
          paciente_id: pacienteId,
          exame_id: selectedExam,
          resultado: selectedExamResult,
          data_exame: selectedExamDate
        }
      );

      showAlertComponent(
        'Exame salvo com sucesso!',
        'success',
        true,
        setAlert
      );

      setOpenAddPatientResultModal(false);      
    } catch (error) {
      console.log(error);
      console.log(error.name);
      if (error.name === 'AxiosError') {
        console.log(error.response.data);
      }
    }
    finally {
      setLoading(false);
      showAlertComponent(
        'Exame salvo com sucesso!',
        'success',
        false,
        setAlert
      );
    }

  }

  return (
    <>
      {
        openAddPatientResultModal ?
        <Backdrop onClick={ handleCloseIconClick }/>
        : null
      }

      <div className={`wrapper ${styles["modal"]} ${ returnShowClass(openAddPatientResultModal) }`}>
        <div className={styles["modal__header"]}>
          <h2 className={styles["title"]}>Adicionar Resultado</h2>

          <div className={styles["modal__icon-wrapper"]} onClick={ handleCloseIconClick }>
            <FaXmark 
              size={ returnIconSizeByWindowSize() } 
              className={ styles["modal__icon"] }
            />
          </div>
        </div>

        <Alert
          message={ alert.message }
          type={ alert.type }
          show={ alert.show }
        />

        <form className={styles["modal__form"]} onSubmit={ handleFormSubmit } ref={ formRef }>
          <section className={styles["modal__form-section"]}>
            <label htmlFor="selectedExam" className={styles["modal__form-label"]}>Exame:</label>
            <select
              name="selectedExam"
              id="selectedExam"
              className={styles["modal__form-input"]}
              defaultValue={ selectedExam }
              onChange={ handleExamChange }
            >
              <option value="0">Selecione uma opção</option>
              {
                allExams.map((exam, index) => (
                  <option key={ index } value={ exam.id }>{ exam.nome }</option>
                ))
              }
            </select>
            {
              !showHelperText.selectedExam.show ?
              null :
              <p className={ styles["modal__form-error"]} >{ showHelperText.selectedExam.message }</p>
            }
          </section>

          <section className={styles["modal__form-section"]}>
            <label htmlFor="selectedExamDate" className={styles["modal__form-label"]}>Data do Exame:</label>
            <input type="date" id="selectedExamDate" className={styles["modal__form-input"]} onChange={ handleExamDateChange }/>
            {
              !showHelperText.selectedExamDate.show ?
              null :
              <p className={ styles["modal__form-error"]} >{ showHelperText.selectedExamDate.message }</p>
            }
          </section>
          
          <section className={styles["modal__form-section"]}>
            <label htmlFor="selectedExamResult" className={styles["modal__form-label"]}>Resultado:</label>
            <input type="text" name="selectedExamResult" id="selectedExamResult" className={styles["modal__form-input"]} onChange={ handleSelectedExamResultChange } />
            {
              !showHelperText.selectedExamResult.show ?
              null :
              <p className={ styles["modal__form-error"]} >{ showHelperText.selectedExamResult.message }</p>
            }
          </section>

          <section className={styles["modal__form-section"]}>
            <button type="submit" className={styles["modal__form-submit"]}>
              {
                loading ?
                <Loader/> :
                <>
                  Salvar
                  <FaCheck size={returnIconSizeByWindowSize()}/>
                </>  
              }
            </button>

            <button type="button" className={styles["modal__form-cancel"]} onClick={ handleCloseIconClick }>
              Cancelar
              <FaXmark size={returnIconSizeByWindowSize()}/>
            </button>
          </section>
            
        </form>
      </div>
    </>
  );
}