import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ExamReaderAddExamAtom } from "../../../../jotai";
import { Alert, Backdrop, Loader } from "../../../../components";

import styles from './styles.module.css';
import { FaCheck, FaCirclePlus, FaTrash, FaXmark } from "react-icons/fa6";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../../../utils";
import axios from "axios";

export default function AddExamResultsModal() {
  const [openAddExamModal, setOpenaddExamModal] = useAtom(ExamReaderAddExamAtom);
  const backdropRef = useRef(null);
  const closeIconRef = useRef(null);
  const [ loading, setLoading ] = useState(false);
  const [ examName, setExamName ] = useState('');
  const [ examsResults, setExamsResults ] = useState([{ value: '', result: '' }]);
  const [ showHelperText, setShowHelperText ] = useState({
    examName: false,
    examsResults: false
  });
  const [ alert, setAlert ] = useState({
    message: 'teste',
    type: 'success',
    show: false
  });

  useEffect(() => () => {
    setExamsResults([{ value: '', result: '' }]);
  }, []);

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

  function handleAddExamClick() {
    setExamsResults([...examsResults, { value: '', result: '' }]);
  }

  function handleResultChange(index, field, newValue) {
    const newResults = examsResults.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    setExamsResults(newResults);
  }

  function handleDeleteResult(index) {
    const newResults = examsResults.filter((_, i) => i !== index);
    setExamsResults(newResults.length > 0 ? newResults : [{ value: '', result: '' }]);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!examName) {
      return setShowHelperText({
        ...showHelperText,
        examName: true
      });
    }

    let filtredExamResults = examsResults.filter(item => item.value && item.result);
    
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

      let exam_result = await axios.post(
        `${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exam-results/batch`, 
        filtredExamResults.map(item => ({
          resultado: item.result,
          valor: Number(item.value.replace(',', '.')),
          exame_id: 1
        }))
      );
      exam_result = exam_result.data;

      console.log(exam);
      console.log(exam_result);

      showAlertComponent(
        'Exame salvo com sucesso!',
        'success',
        true,
        setAlert
      );
      
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
      <Backdrop className={styles['examreader-backdrop']} onClick={handleCloseIconClick} ref={backdropRef}>
        <div className={`wrapper ${styles["modal"]} ${openAddExamModal ? styles["modal--show"] : ''}`}>
          <div className={styles["modal__header"]}>
            <h2 className={styles["title"]}>Adicionar exame</h2>

            <FaXmark 
              size={returnIconSizeByWindowSize()} 
              className={styles["modal__icon"]} 
              onClick={handleCloseIconClick}
              ref={closeIconRef}
            />
          </div>

          <Alert
            message={ alert.message }
            type={ alert.type }
            show={ alert.show }
          />

          <form className={styles["modal__form"]} onSubmit={ handleFormSubmit }>
            <section className={styles["modal__form-section"]}>
              <label htmlFor="examName" className={styles["modal__form-label"]}>Exame:</label>
              <input type="text" id="examName" className={styles["modal__form-input"]} onChange={ handleExamNameChange }/>
              {
                !showHelperText.examName ?
                null :
                <p className={ styles["modal__form-error"]} >O nome do exame deve estar preenchido</p>
              }
            </section>
            
            <section className={styles["modal__form-section"]}>
              <h3 className={styles["section-title"]}>Resultados Possíveis</h3>

              {examsResults.map((result, index) => (
                <FormSubSection
                  key={index}
                  index={index}
                  value={result.value}
                  result={result.result}
                  onValueChange={(e) => handleResultChange(index, 'value', e.target.value)}
                  onResultChange={(e) => handleResultChange(index, 'result', e.target.value)}
                  onDelete={() => handleDeleteResult(index)}
                />
              ))}
              
              <button type="button" onClick={handleAddExamClick} className={styles["modal__form-addmore"]} disabled={loading}>
                Adicionar Resultado
                <FaCirclePlus size={returnIconSizeByWindowSize()}/>  
              </button>
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

function FormSubSection({ index, value, result, onValueChange, onResultChange, onDelete }) {
  return (
    <div className={styles["modal__form-subsection"]}>
      <div className={styles["modal__form-subsubsection"]}>
        <label htmlFor={ `v${index}` } className={styles["modal__form-label"]}>Valor:</label>
        <input
          id={ `v${index}` }
          type="text" 
          value={value} 
          className={styles["modal__form-input"]} 
          onChange={onValueChange}
        />
      </div>

      <div className={styles["modal__form-subsubsection"]}>
        <label htmlFor={ `r${index}` } className={styles["modal__form-label"]}>Classificação:</label>
        <input
          id={ `r${index}` }
          type="text"
          value={result} 
          className={styles["modal__form-input"]} 
          onChange={onResultChange}
        />
      </div>

      <div className={styles["modal__form-subsubsection"]}>
        <label htmlFor={ `s${index}` } className={styles["modal__form-label"]}>Sexo:</label>
        <select id={ `s${index}` } className={styles["modal__form-select"]}>
          <option value="ambos" selected>Ambos</option>
          <option value="m">Homens</option>
          <option value="f">Mulheres</option>
        </select>
        {/* <input
          id={ `r${index}` }
          type="text"
          value={result} 
          className={styles["modal__form-input"]} 
          onChange={onResultChange}
        /> */}
      </div>

      <div className={styles["modal__form-delete-icon-wrapper"]}>
        <FaTrash 
          size={ returnIconSizeByWindowSize() }
          className={styles["modal__form-delete-icon"]}
          onClick={ onDelete }
        />
      </div>
    </div>
  );
}