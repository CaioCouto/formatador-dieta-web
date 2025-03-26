import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { ExamReaderAddPatientAtom } from "../../../../jotai";
import { Alert, Backdrop, Loader } from "../../../../components";

import styles from './styles.module.css';
import { FaCheck, FaXmark } from "react-icons/fa6";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../../../utils";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddPatientModal() {
  const navigate = useNavigate();
  const [ openAddPatientModal, setOpenAddPatientModal ] = useAtom(ExamReaderAddPatientAtom);
  const [ loading, setLoading ] = useState(false);
  const [ patientName, setPatientName ] = useState('');
  const [ patientBirthdate, setPatientBirthdate ] = useState('');
  const [ patientGender, setPatientGender ] = useState('');
  const [ showHelperText, setShowHelperText ] = useState({
    patientName: false,
    patientBirthdate: false,
    patientGender: false
  });
  const [ alert, setAlert ] = useState({
    message: 'teste',
    type: 'success',
    show: false
  });

  useEffect(() => { setPatientName(''); }, []);

  function returnShowClass() {
    if(openAddPatientModal) {
      return styles["modal--show"];
    }
  }

  function handleCloseIconClick(e) {
    setOpenAddPatientModal(false);
  }

  function handlePatientNameChange(e) {
    setPatientName(e.target.value);
    setShowHelperText({
      ...showHelperText,
      patientName: false
    });
  }

  function handlePatientBirthdateChange(e) {
    setPatientBirthdate(e.target.value);
    setShowHelperText({
      ...showHelperText,
      patientBirthdate: false
    });
  }

  function handlePatientGenderChange(e) {
    setPatientGender(e.target.value);
    setShowHelperText({
      ...showHelperText,
      patientBirthdate: false
    });
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (!patientName || !patientBirthdate || !patientGender) {
      return setShowHelperText({
        patientName: !patientName,
        patientBirthdate: !patientBirthdate,
        patientGender: !patientGender,
      });
    }
    
    setLoading(true);

    showAlertComponent(
      'Salvando Paciente...',
      'info',
      true,
      setAlert
    );

    try {
      let patient = await axios.post(
        `${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/patients/`, 
        { 
          nome: patientName,
          data_nascimento: patientBirthdate,
          sexo: patientGender
        }
      );
      patient = patient.data;

      showAlertComponent(
        'Paciente salvo com sucesso!',
        'success',
        true,
        setAlert
      );

      setOpenAddPatientModal(false);

      navigate(`/patients/${patient.id}`);
      
    } catch (error) {
      console.log(error);
      console.log(error.name);
      if (error.name === 'AxiosError') {
        console.log(error.response.data);
      }
    }
    finally {
      setLoading(false);
    }

  }

  return (
    <>
      {
        openAddPatientModal ?
        <Backdrop onClick={ handleCloseIconClick }/>
        : null
      }

      <div className={`wrapper ${styles["modal"]} ${ returnShowClass() }`}>
        <div className={styles["modal__header"]}>
          <h2 className={styles["title"]}>Adicionar Paciente</h2>

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

        <form className={styles["modal__form"]} onSubmit={ handleFormSubmit }>
          <section className={styles["modal__form-section"]}>
            <label htmlFor="patientName" className={styles["modal__form-label"]}>Nome:</label>
            <input type="text" id="patientName" className={styles["modal__form-input"]} onChange={ handlePatientNameChange }/>
            {
              !showHelperText.patientName ?
              null :
              <p className={ styles["modal__form-error"]} >O nome do paciente deve estar preenchido.</p>
            }
          </section>

          <section className={styles["modal__form-section"]}>
            <label htmlFor="patientBirthdate" className={styles["modal__form-label"]}>Data de Nascimento:</label>
            <input type="date" id="patientBirthdate" className={styles["modal__form-input"]} onChange={ handlePatientBirthdateChange }/>
            {
              !showHelperText.patientBirthdate ?
              null :
              <p className={ styles["modal__form-error"]} >A data de nascimento do paciente deve ser selecionada.</p>
            }
          </section>
          
          <section className={styles["modal__form-section"]}>
            <label htmlFor="patientGender" className={styles["modal__form-label"]}>Sexo:</label>
            <select name="patientGender" id="patientGender"  className={styles["modal__form-input"]} onChange={ handlePatientGenderChange }>
              <option value="">Selecione uma opção</option>
              <option value="m">Masculino</option>
              <option value="f">Feminino</option>
            </select>
            {
              !showHelperText.patientGender ?
              null :
              <p className={ styles["modal__form-error"]} >O sexo do paciente deve ser selecionado.</p>
            }
          </section>
            
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
        </form>
      </div>
    </>
  );
}