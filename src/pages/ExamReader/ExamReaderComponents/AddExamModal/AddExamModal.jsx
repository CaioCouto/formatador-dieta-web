import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ExamReaderAddExamAtom } from "../../../../jotai";
import { Alert, Backdrop, Loader } from "../../../../components";

import styles from './styles.module.css';
import { FaCheck, FaXmark } from "react-icons/fa6";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../../../utils";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddExamModal() {
  const navigate = useNavigate();
  const [openAddExamModal, setOpenaddExamModal] = useAtom(ExamReaderAddExamAtom);
  const backdropRef = useRef(null);
  const closeIconRef = useRef(null);
  const [ loading, setLoading ] = useState(false);
  const [ examName, setExamName ] = useState('');
  const [ showHelperText, setShowHelperText ] = useState({
    examName: false,
    examsResults: false
  });
  const [ alert, setAlert ] = useState({
    message: 'teste',
    type: 'success',
    show: false
  });

  useEffect(() => { setExamName(''); }, []);

  function handleCloseIconClick(e) {
    const target = e.target;
    if(target === closeIconRef.current || target === backdropRef.current) { 
      setOpenaddExamModal(false);
    }
  }

  function handleExamNameChange(e) {
    setExamName(e.target.value);
    setShowHelperText({
      ...showHelperText,
      examName: false
    });
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
        { nome: examName }
      );
      exam = exam.data;

      showAlertComponent(
        'Exame salvo com sucesso!',
        'success',
        true,
        setAlert
      );

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

  if(openAddExamModal) {
    return (
      <Backdrop className={styles['examreader-backdrop']} onClick={ handleCloseIconClick } ref={backdropRef}>
        <div className={`wrapper ${styles["modal"]} ${openAddExamModal ? styles["modal--show"] : ''}`}>
          <div className={styles["modal__header"]}>
            <h2 className={styles["title"]}>Adicionar exame</h2>

            <div className={styles["modal__icon-wrapper"]} onClick={ handleCloseIconClick }>
              <FaXmark 
                size={ returnIconSizeByWindowSize() } 
                className={ styles["modal__icon"] } 
                ref={closeIconRef}
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
      </Backdrop>
    );
  }
}