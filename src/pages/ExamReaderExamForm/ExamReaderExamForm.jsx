import styles from "./styles.module.css";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaCheck, FaCirclePlus, FaTrash, FaXmark } from "react-icons/fa6";
import { Alert, ConfirmationModal, ExamResultsRefereceTableModal, Loader } from "../../components";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../utils";
import { useAtom } from "jotai";
import { ConfirmationModalAtom, ExamResultsRefereceTableModalAtom } from "../../jotai";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { FormFieldError, Exams, ExamResults } from "../../classes";

const examsController = new Exams();
const examsResultsController = new ExamResults();

function evaluateIfExamResultsHaveChanged(originalResults, newResults) {
  if(originalResults.length !== newResults.length) {
    return true;
  }

  for (let i = 0; i < originalResults.length; i++) {
    if(originalResults[i].valor !== newResults[i].valor) {
      return true;
    }
  }

  return false;
}

export default function ExamReaderExamForm() {
  const navigate = useNavigate();

  const examId = Number(useParams('id').id);
  const deleteExamResultButtonRef = useRef(null);
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ showExamResultsRefereceTableModal, setShowExamResultsRefereceTableModal ] = useAtom(ExamResultsRefereceTableModalAtom);
  const [ loading, setLoading ] = useState(false);
  const [ edit, setEdit ] = useState(false);
  const [ examsResults, setExamsResults ] = useState([{ valor: '', resultado: '', sexo: 'ambos' }]);
  const [ exam, setExam ] = useState(null);
  const [ examName, setExamName ] = useState('');
  const [ examUnit, setExamunit ] = useState('');
  const [ resultIndexToBeDeleted, setResultIndexToBeDeleted ] = useState(null);
  const [ alert, setAlert ] = useState({
    message: 'Nothing yet...',
    type: 'success',
    show: false
  });

  async function getExamByRouteId() {
    let responseExame = await examsController.getExamById(examId);
    
    if (responseExame.status !== 200) {
      showAlertComponent(
        `${responseExame.message} Redirecionando para lista de exames...`,
        'error',
        true,
        setAlert
      );
      setTimeout(() => {navigate('/exams/list', { replace: true }); }, 3000);
      return;
    }

    responseExame = responseExame.data;
    setExam(responseExame);
    setExamName(responseExame.nome);
    setExamunit(responseExame.unidade);
    if(responseExame.resultados_exames.length > 0) {
      setExamsResults(responseExame.resultados_exames);
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

  function handleExamUnitChange(e) {
    setExamunit(e.target.value);
  }

  function handleResultChange(index, field, newValue) {
    const newResults = examsResults.map((item, i) => 
      i === index ? { ...item, [field]: newValue.replace('.', ',') } : item
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
        await examsController.deleteExam(examId);
        return navigate('/exams/list', { replace: true });
      }
      const examResultId = examsResults[resultIndexToBeDeleted].id;
      const newResults = examsResults.filter((_, i) => i !== resultIndexToBeDeleted);
      
      if(examResultId) {
        await examsResultsController.deleteExamResult(examResultId);
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
      if(!examName) {
        setExamName(exam.nome);
        throw new FormFieldError('O nome do exame não pode estar vazio.');
      }
      
      let filteredExamsResults = examsResults
                                  .filter(item => item.valor && item.resultado)
                                  .map(item => ({ 
                                    ...item,
                                    exame_id: examId,
                                    valor: item.valor.replace(/[.]/g, '')
                                  }));

      let examResponse, createExamResultsResponse, updateExamResultsResponse;
      const examResultsHaveChanged = evaluateIfExamResultsHaveChanged(exam.resultados_exames, filteredExamsResults);

      if(examName === exam.nome && examUnit === exam.unidade && !examResultsHaveChanged) {
        return;
      }
      else {
        setLoading(true);

        showAlertComponent(
          'Atualizando Dados do exame...',
          'info',
          true,
          setAlert
        );
        
        if(examName !== exam.nome || examUnit !== exam.unidade) {
          examResponse = await examsController.updateExam(examId, examName, examUnit);
        }
        
        if(examResultsHaveChanged) {
          const resultsToUpdate = []; 
          const resultsToCreate = [];
          filteredExamsResults.forEach(result => {
            if(result.id) { resultsToUpdate.push(result); }
            else { resultsToCreate.push(result); }
          });

          createExamResultsResponse = await examsResultsController.createExamResults(resultsToCreate);
          updateExamResultsResponse = await examsResultsController.updateExamResults(resultsToUpdate);
        }
      }

      if(
        (examResponse && examResponse.status !== 200) || 
        (createExamResultsResponse && createExamResultsResponse.status !== 200) ||
        (updateExamResultsResponse && updateExamResultsResponse.status !== 200)
      ) {
        showAlertComponent(
          examResponse.message || createExamResultsResponse.message || updateExamResultsResponse.message,
          'error',
          true,
          setAlert
        );
        return;
      }

      showAlertComponent(
        'Exame atualizado com sucesso!',
        'success',
        true,
        setAlert
      );
      setEdit(false);
      setLoading(false);
    } catch (error) {
      let alertMessage = error.message || 'Um erro correu ao atualizar o exame.';

      alertMessage = error.message;

      showAlertComponent(
        alertMessage,
        'error',
        true,
        setAlert
      );
      
    } finally {
      setEdit(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    getExamByRouteId();
  }, []);

  return (
    <main className={ `wrapper ${styles["editor"]}` }>
      <Alert
        message={ alert.message }
        type={ alert.type }
        show={ alert.show }
      />

      {
        !exam ? 
          <Splash /> :
          <form className={ `wrapper ${styles["editor__form"]}` } onSubmit={ handleFormSubmit }>
            {
              showExamResultsRefereceTableModal ?
              <ExamResultsRefereceTableModal results={ examsResults } />
              : null
            }

            <Link to="/exams/list" className={ styles["editor__form-back"] }>
              <FaArrowLeft size={ returnIconSizeByWindowSize() } />
              <span>Lista de Exames</span>
            </Link>

            <section className={ `${styles["editor__form-section-examData"]} ${styles["editor__form-section"]}` }>
              <div className={ styles["editor__form-subsection"] }>
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
              </div>

              <div className={ styles["editor__form-subsection"] }>
                <label htmlFor="examUnit">Unidade</label>
                <input 
                  type="text"
                  name="examUnit"
                  id="examUnit" 
                  className={styles["editor__form-input"]}
                  value={ examUnit } 
                  onChange={ handleExamUnitChange } 
                  disabled={ !edit }  
                />
              </div>
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

