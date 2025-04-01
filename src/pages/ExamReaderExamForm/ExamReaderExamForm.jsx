import styles from "./styles.module.css";
import axios, { all, Axios } from "axios";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaCheck, FaCircleCheck, FaCirclePlus, FaDownload, FaEye, FaTrash, FaUpload, FaXmark } from "react-icons/fa6";
import { Alert, Backdrop, ConfirmationModal, ExamResultsRefereceTableModal, Loader } from "../../components";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../utils";
import { useAtom } from "jotai";
import { ConfirmationModalAtom, ExamReaderAddExamAtom, ExamResultsRefereceTableModalAtom, IconSizeAtom, ShowBackdropAtom } from "../../jotai";
import { Link, useParams } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { EmptyExamNameError, EmptyExamResultsError } from "../../classes";

async function updateExamsNameOnDataBase(examId, examName) {
  await axios.patch(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/${examId}`, 
    { nome: examName }
  );
}

async function deleteExamFromDatabase(examId) {
  await axios.delete(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/${examId}`);
}

async function updateExamsResultsOnDataBase(examId, examResults) {
  await axios.patch(
    `${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exam-results/${examId}`, 
    examResults
  );
}

async function deleteExamResultOnDataBase(examResultId) {
  await axios.delete(
    `${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exam-results/${examResultId}`
  );
}

export default function ExamReaderExamForm() {
  const examId = Number(useParams('id').id);
  const deleteExamButtonRef = useRef(null);
  const deleteExamResultButtonRef = useRef(null);
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ showExamResultsRefereceTableModal, setShowExamResultsRefereceTableModal ] = useAtom(ExamResultsRefereceTableModalAtom);
  const [ loading, setLoading ] = useState(false);
  const [ edit, setEdit ] = useState(false);
  const [ examsResults, setExamsResults ] = useState([{ valor: '', resultado: '', sexo: 'ambos' }]);
  const [ exam, setExam ] = useState(null);
  const [ examName, setExamName ] = useState('');
  const [ resultIndexToBeDeleted, setResultIndexToBeDeleted ] = useState(null);
  const [ alert, setAlert ] = useState({
    message: 'Nothing yet...',
    type: 'success',
    show: false
  });

  async function getExamByRouteId() {
    let responseExame = await axios.get(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/${examId}`);
    responseExame = responseExame.data;
    setExam(responseExame);
    setExamName(responseExame.nome);
    if(responseExame.resultados.length > 0) {
      setExamsResults(responseExame.resultados);
    }
  }

  function handleSubmitbuttonClick() {
    setEdit(!edit);
  }

  function handleAddExamResultClick() {
    setExamsResults([...examsResults, { valor: '', resultado: '', sexo: 'ambos' }]);
  }

  function handleExamNameChange(e) {
    setExamName(e.target.value);
  }

  function handleResultChange(index, field, newValue) {
    const newResults = examsResults.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    setExamsResults(newResults);
  }

  function openReferenceValuesTableModal() {
    setShowExamResultsRefereceTableModal(true);
  }

  async function openDeleteConfirmationModal(index) {
    let message;

    if(typeof(index) === 'number') {
      message = 'Tem certeza que deseja excluir esse resultado?',
      setResultIndexToBeDeleted(index);
    }
    else {
      message = 'Tem certeza que deseja excluir esse exame?';
    }

    setConfirmationModal({
      show: true,
      message: message,
    });
  }

  async function handleDeleteExamOrResult() {
    try {
      const resultIndexToBeDeletedIsNull = resultIndexToBeDeleted === null;
      let alertMessage;
      setConfirmationModal({
        ...confirmationModal,
        show: false,
      });

      setLoading(true);
      
      if(!resultIndexToBeDeletedIsNull) {
        alertMessage = 'Deletando resultado...';
      }
      else {
        alertMessage = 'Deletando exame...';
      }
      
      setAlert({
        message: alertMessage,
        type: 'info',
        show: true
      });

      if(resultIndexToBeDeletedIsNull) {
        await deleteExamFromDatabase(examId);
        return window.location.href = '/exams/list';
      }
      const examResultId = examsResults[resultIndexToBeDeleted].id;
      const newResults = examsResults.filter((_, i) => i !== resultIndexToBeDeleted);
      
      if(examResultId) {
        await deleteExamResultOnDataBase(examResultId);
      }
      
      setExamsResults(newResults.length > 0 ? newResults : [{ value: '', result: '' }]);
      setResultIndexToBeDeleted(null);
    
      setAlert({
        message: 'Resultado deletado com sucesso!',
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
        })
      }, 5000);

    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
      setLoading(true);
      let filteredExamsResults = examsResults.filter(item => item.valor && item.resultado);
      
      if(!examName) {
        setExamName(exam.nome);
        throw new EmptyExamNameError('O nome do exame não pode estar vazio.');
      }
      else if (filteredExamsResults.length === 0) {
        throw new EmptyExamResultsError('Pelo menos um resultado deve ser adicionado.');
      }

      filteredExamsResults = filteredExamsResults.map(item => ({ 
        ...item,
        exame_id: examId,
        valor: item.valor
      }));

      setAlert({
        message: 'Atualizando Dados do exame...',
        type: 'info',
        show: true
      })

      await updateExamsNameOnDataBase(examId, examName);
      await updateExamsResultsOnDataBase(examId, filteredExamsResults);
      
      setAlert({
        message: 'Exame atualizado com sucesso!',
        type: 'success',
        show: true
      });

      window.location.reload();
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
      setEdit(false);
      setLoading(false);

      setTimeout(() => {
        setAlert({
          ...alert,
          show: false
        })
      }, 5000);
    }
  }

  useEffect(() => {
    getExamByRouteId();
  }, []);

  return (
    <main className={ `wrapper ${styles["editor"]}` }>
      {
        !exam ? 
          <Splash /> :
          <form className={ `wrapper ${styles["editor__form"]}` } onSubmit={ handleFormSubmit }>
            {
              showExamResultsRefereceTableModal ?
              <ExamResultsRefereceTableModal results={ examsResults } />
              : null
            }

            <Alert
              message={ alert.message }
              type={ alert.type }
              show={ alert.show }
            />

            <Link to="/exams/list" className={ styles["editor__form-back"] }>
              <FaArrowLeft size={ returnIconSizeByWindowSize() } />
              <span>Lista de Exames</span>
            </Link>

            <section className={ styles["editor__form-section"] }>
              <label htmlFor="examName">Nome do Exame</label>
              <input 
                type="text"
                name="examName"
                id="examName" 
                className={styles["editor__form-input"]}
                value={ examName } 
                onChange={ handleExamNameChange } 
                disabled={ !edit }  
              />
            </section>

            <section className={styles["editor__form-section"]}>
              {
                !confirmationModal.show ?
                null:
                <DeleteConfirmationModal 
                  modalMessage={ confirmationModal.message }
                  onConfirm={ handleDeleteExamOrResult }
                />
              }

              <div className={styles["section-title-wrapper"]}>
                <h3 className={styles["section-title"]}>Resultados Possíveis</h3>
                <span 
                  className={styles["section-reference-values"]}
                  onClick={ openReferenceValuesTableModal }
                >
                  Valores de Referência
                </span>
              </div>

              {
                examsResults.map((result, index) => (
                  <FormSubSection
                    key={index}
                    allResults={examsResults}
                    edit={edit}
                    index={index}
                    value={result.valor}
                    result={result.resultado}
                    gender={result.sexo}
                    deleteExamResultButtonRef={deleteExamResultButtonRef}
                    onValueChange={(e) => handleResultChange(index, 'valor', e.target.value)}
                    onResultChange={(e) => handleResultChange(index, 'resultado', e.target.value)}
                    onGenderChange={(e) => handleResultChange(index, 'sexo', e.target.value)}
                    onDelete={() => openDeleteConfirmationModal(index)}
                  />
                ))
              }

              {
                !edit ?
                null :
                <button 
                  type="button" 
                  onClick={handleAddExamResultClick} 
                  className={styles["editor__form-addmore"]} 
                  disabled={loading}
                >
                  Adicionar Resultado
                  <FaCirclePlus size={returnIconSizeByWindowSize()}/>  
                </button>
              }
            </section>

            <section className={styles["editor__form-actions"]}>
              {
                edit ?
                <ActiveFormButtons 
                  loading={loading} 
                  handleSubmitbuttonClick={handleSubmitbuttonClick}
                /> :
                <InactiveFormButtons 
                  handleSubmitbuttonClick={handleSubmitbuttonClick}
                  handleDeleteClick={(e) => openDeleteConfirmationModal(e)}
                />
              }
            </section>
          </form>
      }
    </main>
  );
}


function InactiveFormButtons({ handleSubmitbuttonClick, handleDeleteClick, deleteExamButtonRef }) {
  return (
    <>
      <button type="button" className={styles["editor__form-submit"]} onClick={handleSubmitbuttonClick}>
        Editar
        <FaRegEdit size={returnIconSizeByWindowSize()}/>
      </button>

      <button 
        type="button" 
        className={ styles["editor__form-cancel"] } 
        onClick={ handleDeleteClick }
      >
        Excluir
        <FaTrash size={returnIconSizeByWindowSize()}/>
      </button>
    </>
  );
}

function ActiveFormButtons({ loading, handleSubmitbuttonClick }) {
  return (
    <>
      <button
        type="submit" 
        className={styles["editor__form-submit"]}
      >
        {
          loading ?
          <Loader/> :
          <>
            Salvar
            <FaCheck size={returnIconSizeByWindowSize()}/>
          </>  
        }
      </button>

      <button 
        type="button" 
        className={styles["editor__form-cancel"]} 
        onClick={handleSubmitbuttonClick}
      >
        Cancelar
        <FaXmark size={returnIconSizeByWindowSize()}/>
      </button>
    </>
  );
}

function Splash() {
  return (
    <section className={ `wrapper ${styles["editor__splash"]}` }>
      Carregando Exame...
      <Loader />
    </section>
  );
}

function DeleteConfirmationModal({ modalMessage, onConfirm }) {
  return (
    <ConfirmationModal
      message={ modalMessage }
      onConfirm={ onConfirm }
    />
  );
}

function FormSubSection({ allResults, index, edit, value, result, gender, onValueChange, onResultChange, onGenderChange, onDelete }) {
  return (
    <fieldset className={styles["editor__form-subsection"]}>
      <legend className={styles["editor__form-subsection-legend"]}>
        Resultado {index+1}
      </legend>

      <div  className={styles["editor__form-subsection-inputs"]}>
        <div className={styles["editor__form-subsubsection"]}>
          <label htmlFor={ `v${index}` } className={styles["editor__form-label"]}>Valor:</label>
          <input
            id={ `v${index}` }
            type="text" 
            value={value} 
            className={styles["editor__form-input"]} 
            onChange={onValueChange}
            disabled={ !edit }
          />
        </div>

        <div className={styles["editor__form-subsubsection"]}>
          <label htmlFor={ `r${index}` } className={styles["editor__form-label"]}>Classificação:</label>
          <input
            id={ `r${index}` }
            type="text"
            value={result} 
            className={styles["editor__form-input"]} 
            onChange={onResultChange}
            disabled={ !edit }
          />
        </div>

        <div className={styles["editor__form-subsubsection"]}>
          <label htmlFor={ `s${index}` } className={styles["editor__form-label"]}>Sexo:</label>
          <select 
            id={ `s${index}` } 
            className={styles["editor__form-select"]} 
            defaultValue={ gender }
            onChange={ onGenderChange }
            disabled={ !edit }
          >
            <option value="ambos">Ambos</option>
            <option value="m">Homens</option>
            <option value="f">Mulheres</option>
          </select>
        </div>
      </div>

      {
        edit && allResults.length > 1 ?
        <button 
          type="button"
          className={ styles["editor__form-delete-icon-wrapper"] } 
          onClick={ onDelete }
        >
          Excluir Resultado
          <FaTrash 
            size={ returnIconSizeByWindowSize() }
            className={styles["editor__form-delete-icon"]}
          />
        </button>
        : null 
      }
    </fieldset>
  );
}

