import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { ExamReaderAddExamAtom } from "../../../../jotai";
import { Alert, Backdrop, Loader } from "../../../../components";

import styles from './styles.module.css';
import { FaCheck, FaXmark } from "react-icons/fa6";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../../../utils";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddExamModal() {
  const navigate = useNavigate();
  const [ openAddExamModal, setOpenaddExamModal ] = useAtom(ExamReaderAddExamAtom);
  const [ loading, setLoading ] = useState(false);
  const [ examName, setExamName ] = useState('');
  const [ examUnit, setExamUnit ] = useState('');
  const [ showHelperText, setShowHelperText ] = useState({
    examName: false
  });
  const [ alert, setAlert ] = useState({
    message: 'teste',
    type: 'success',
    show: false
  });

  useEffect(() => { setExamName(''); }, []);

  function returnShowClass() {
    if(openAddExamModal) {
      return styles["modal--show"];
    }
  }

  function handleCloseIconClick(e) {
    setOpenaddExamModal(false);
  }

  function handleExamNameChange(e) {
    setExamName(e.target.value);
    setShowHelperText({
      ...showHelperText,
      examName: false
    });
  }

  function handleExamUnitChange(e) {
    setExamUnit(e.target.value);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!examName) {
      return setShowHelperText({
        ...showHelperText,
        examName: true
      });
    }
    
    setLoading(true);

    showAlertComponent(
      'Salvando Exame...',
      'info',
      true,
      setAlert
    );

    try {
      let exam = await axios.post(
        `${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/`, 
        { nome: examName, unidade: examUnit }
      );
      exam = exam.data;

      showAlertComponent(
        'Exame salvo com sucesso!',
        'success',
        true,
        setAlert
      );

      setOpenaddExamModal(false);

      navigate(`/exams/${exam.id}`);
      
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
        openAddExamModal ?
        <Backdrop onClick={ handleCloseIconClick }/>
        : null
      }

      <div className={`wrapper ${styles["modal"]} ${ returnShowClass() }`}>
        <div className={styles["modal__header"]}>
          <h2 className={styles["title"]}>Adicionar exame</h2>

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
            <label htmlFor="examName" className={styles["modal__form-label"]}>Nome do exame:</label>
            <input type="text" id="examName" className={styles["modal__form-input"]} onChange={ handleExamNameChange }/>
            {
              !showHelperText.examName ?
              null :
              <p className={ styles["modal__form-error"]} >O nome do exame deve estar preenchido</p>
            }
          </section>

          <section className={styles["modal__form-section"]}>
            <label htmlFor="examName" className={styles["modal__form-label"]}>Unidade do exame:</label>
            <input type="text" id="examName" className={styles["modal__form-input"]} onChange={ handleExamUnitChange }/>
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