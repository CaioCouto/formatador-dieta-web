import styles from "./styles.module.css";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaCheck, FaChevronDown, FaCircleCheck, FaCircleInfo, FaCirclePlus, FaDownload, FaEye, FaTrash, FaUpload, FaXmark } from "react-icons/fa6";
import { Alert, Backdrop, ConfirmationModal, ExamResultsRefereceTableModal, Loader } from "../../components";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../utils";
import { useAtom } from "jotai";
import { AddPatientResultModalAtom, ConfirmationModalAtom, ExamReaderAddExamAtom, ExamResultsRefereceTableModalAtom, IconSizeAtom, ShowBackdropAtom } from "../../jotai";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyExamNameError, EmptyExamResultsError } from "../../classes";
import { AddPatientResultModal } from "./ExamReaderPatientFormComponents";
import { FormFieldError } from "../../classes/Error";



function returnFormateddate(date) {
  return date.split('-').reverse().join('/');
}

async function updatePatientDataOnDataBase(id, data) {
  await axios.patch(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/patients/${id}`, 
    data
  );
}

async function updatePatientResultsOnDataBase(data) {
  await axios.patch(
    `${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/patient-results/`, 
    data
  );
}

async function deletePatientResultOnDataBase(id) {
  await axios.delete(
    `${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/patient-results/${id}`
  );
}

export default function PatientUpdateForm() {
  const patientId = Number(useParams('id').id);
  const navigate = useNavigate();
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);

  const [ loading, setLoading ] = useState(false);
  const [ resultIndexToBeDeleted, setResultIndexToBeDeleted ] = useState(null);
  const [ resultDateToBeDeleted, setResultDateToBeDeleted ] = useState(null);
  const [ allExams, setAllExams ] = useState([]);
  const [ patientName, setPatientName ] = useState('');
  const [ patientBirthdate, setPatientBirthdate ] = useState('');
  const [ patientSex, setPatientSex ] = useState('');
  const [ patientResults, setPatientResults ] = useState(null);
  const [ showHelperText, setShowHelperText ] = useState({
    patientName: false,
    patientBirthdate: false,
    patientSex: false
  });
  const [ alert, setAlert ] = useState({
    message: 'Nothing yet...',
    type: 'success',
    show: false
  });

  async function getPatientByRouteId() {
    let responsePaciente = await axios.get(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/patients/${patientId}`);
    responsePaciente = responsePaciente.data;
    const formatedPacienteResults = {};
    responsePaciente.resultados.forEach(result => {
      const [ exam ] = responsePaciente.exames.filter(exame => exame.id === result.exame_id);
      const examDate = result.data_exame.split('T')[0];
      const formatedResult = {
        id: result.id,
        nome_exame: exam.nome,
        id_exame: exam.id,
        data_exame: result.data_exame.split('T')[0],
        resultado: result.resultado
      };


      if(formatedPacienteResults[examDate]) {
        formatedPacienteResults[examDate].push(formatedResult);
      }
      else {
        formatedPacienteResults[examDate] = [formatedResult];
      }

      formatedPacienteResults[examDate].sort((a, b) => a.nome_exame.localeCompare(b.nome_exame, 'pt-br'));
    });

    setPatientName(responsePaciente.nome);
    setPatientBirthdate(responsePaciente.data_nascimento.split('T')[0]);
    setPatientSex(responsePaciente.sexo);
    setPatientResults(formatedPacienteResults);
  }

  async function getAllExams() {
    let response = await axios.get(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/`);
    setAllExams(response.data.exams);
  }

  function handlePatientNameChange(e) {
    setPatientName(e.target.value);
  }

  function handlePatientBirthdateChange(e) {
    setPatientBirthdate(e.target.value);
  }

  function handlePatientSexChange(e) {
    setPatientSex(e.target.value);
  }

  function handleResultChange(examDate, index, field, newValue) {
    const copy = structuredClone(patientResults);
    copy[examDate].forEach((item, i) => i === index ? item[field] = newValue : null);
    setPatientResults(copy);
  }

  async function openDeleteConfirmationModal(examDate, index) {
    setResultIndexToBeDeleted(index);
    setResultDateToBeDeleted(examDate);
    setConfirmationModal({
      show: true,
      message: 'Tem certeza que deseja excluir esse resultado?',
    });
  }

  async function handleDeleteExamOrResult() {
    try {
      setConfirmationModal({
        ...confirmationModal,
        show: false,
      });

      setLoading(true);
      
      setAlert({
        message: 'Deletando resultado...',
        type: 'info',
        show: true
      });

      let resultsCopy = structuredClone(patientResults);
      const patientResultId = resultsCopy[resultDateToBeDeleted][resultIndexToBeDeleted].id;
      resultsCopy[resultDateToBeDeleted] = resultsCopy[resultDateToBeDeleted].filter((_, i) => i !== resultIndexToBeDeleted);
      resultsCopy = Object.fromEntries(Object.entries(resultsCopy).filter(([_, v]) => v.length > 0));

      await deletePatientResultOnDataBase(patientResultId);
      setPatientResults(resultsCopy);
      setResultIndexToBeDeleted(null);
      setResultDateToBeDeleted(null);
    
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
      if (!patientName || !patientBirthdate || !patientSex) {
        setShowHelperText({
          patientName: !patientName,
          patientBirthdate: !patientBirthdate,
          patientSex: !patientSex,
        });
        throw new FormFieldError('Todos os campos do formulário devem estar preenchidos!');
      }

      const results = [];
      Object.values(patientResults).forEach(r => {
        r.forEach(res => {
          const tempResult = Number(String(res.resultado).replace(',', '.'));
          if(isNaN(tempResult)) throw new FormFieldError('Os resultados deve conter apenas números válidos.');
          res.resultado = tempResult;
          results.push(res)
        });
      });

      setLoading(true);

      setAlert({
        message: 'Atualizando Dados do exame...',
        type: 'info',
        show: true
      });

      await updatePatientDataOnDataBase(
        patientId, 
        {
          nome: patientName,
          data_nascimento: patientBirthdate.split('T')[0],
          sexo: patientSex
        }
      );
      await updatePatientResultsOnDataBase(results);
      
      setAlert({
        message: 'Paciente atualizado com sucesso!',
        type: 'success',
        show: true
      });

      setTimeout(() => navigate(`/patients/${patientId}`), 2000);
    } catch (error) {      
      let alertMessage = '';

      alertMessage = error.message;

      if(error.name === 'AxiosError') {
        alertMessage = error.response.message;
        console.log(error.response)
      }
      
      setAlert({
        message: alertMessage,
        type: 'error',
        show: true
      });
      
    } finally {
      setLoading(false);
      window.scrollTo({top: 0, behavior: 'smooth' });

      setTimeout(() => {
        setAlert({
          ...alert,
          show: false
        })
      }, 5000);
    }
  }

  useEffect(() => {
    getPatientByRouteId();
    getAllExams();
  }, []);

  return (
    <main className={ `wrapper ${styles["patient"]}` }>
      <AddPatientResultModal pacienteId={ patientId }/>

      <ConfirmationModal
        onConfirm={ handleDeleteExamOrResult }
      />

      <Alert 
        message={ alert.message } 
        type={ alert.type }
        show={ alert.show }
      />

      {
        !patientResults ? 
          <Splash /> :
          <>
            <form className={ styles["patient__form"] } onSubmit={ handleFormSubmit }>
              <Link to={ `/patients/${patientId}` } className={ styles["patient__info-back"] }>
                <FaArrowLeft size={ returnIconSizeByWindowSize() } />
                <span>Voltar para o relatório do paciente</span>
              </Link>

              <h2 className={ styles["patient__form-title"] }>Informações do Paciente</h2>

              <section className={ styles["patient__form-section"] }>
                <label htmlFor="patientName">Nome do paciente</label>
                <input 
                  className={ styles["patient__form-input"] } 
                  type="text" 
                  id="patientName" 
                  name="patientName" 
                  value={ patientName }
                  onChange={ handlePatientNameChange}
                />
                {
                  !showHelperText.patientName ?
                  null :
                  <p className={ styles["patient__form-error"]} >O nome do Paciente deve ser preenchido.</p>
                }
              </section>

              <section className={ styles["patient__form-section"] }>
                <label htmlFor="patientBirthdate">Data de Nascimento</label>
                <input 
                  className={ styles["patient__form-input"] } 
                  type="date" 
                  id="patientBirthdate" 
                  name="patientBirthdate" 
                  value={ patientBirthdate }
                  onChange={ handlePatientBirthdateChange }
                />
                {
                  !showHelperText.patientBirthdate ?
                  null :
                  <p className={ styles["patient__form-error"]} >A data de nascimento do paciente deve ser selecionada.</p>
                }
              </section>

              <section className={ styles["patient__form-section"] }>
                <label htmlFor="patientSex">Sexo</label>
                <select 
                  className={ styles["patient__form-select"] } 
                  name="patientSex" 
                  id="patientSex" 
                  value={ patientSex }
                  onChange={ handlePatientSexChange }
                >
                  <option value="">Escolha uma opção</option>
                  <option value="m">Masculino</option>
                  <option value="f">Feminino</option>
                </select>
                {
                  !showHelperText.patientSex ?
                  null :
                  <p className={ styles["patient__form-error"]} >O sexo do paciente deve ser selecionado.</p>
                }
              </section>

              <h2 className={ styles["patient__form-title"] }>Resultados do Paciente</h2>

              <PatientResults 
                results={ patientResults }
                allExams={ allExams }
                handleResultChange={ handleResultChange }
                openDeleteConfirmationModal={ openDeleteConfirmationModal }
              />

              <section className={ styles["patient__form-section"] }>
                <button 
                  type="submit"
                  className={ styles["patient__form-submit"] }
                >
                  Salvar
                  <FaCheck size={returnIconSizeByWindowSize()}/>
                </button>
              </section>
            </form>
          </>
      }
    </main>
  );
}

function Splash() {
  return (
    <section className={ `wrapper ${styles["editor__splash"]}` }>
      Carregando Dados do paciente...
      <Loader />
    </section>
  );
}

function PatientResults({ results, allExams, handleResultChange, openDeleteConfirmationModal }) {
  return (
    <>
      {
        Object.keys(results).map((examDate) => (
          <fieldset key={ examDate } className={ styles["patient__form-fieldset"] }>
            <legend>{ returnFormateddate(examDate) }</legend>

            {
              results[examDate].map((result, index) => (
                <div key={ index } className={ styles["patient__form-exam-wrapper"] }>
                  <div className={ styles["patient__form-section"] }>
                    <label htmlFor="patientExamId">Exame</label>
                    <select 
                      className={ styles["patient__form-select"] } 
                      name="patientExamId" 
                      id="patientExamId" 
                      value={ result.id_exame }
                      onChange={ (e) => handleResultChange(examDate, index, 'id_exame', Number(e.target.value)) }
                    >
                      {
                        allExams.map((exam) => (
                          <option key={ exam.id } value={ exam.id }>{ exam.nome }</option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div className={ styles["patient__form-section"] }>
                    <label htmlFor="patientExamResult">Resultado do Exame</label>
                    <input 
                      className={ styles["patient__form-input"] } 
                      type="text" 
                      name="patientExamResult" 
                      id="patientExamResult" 
                      value={ String(result.resultado).replace('.', ',') }
                      onChange={ (e) => handleResultChange(examDate, index, 'resultado', e.target.value) }
                    />
                  </div>
                  
                  <div className={ styles["patient__form-section"] }>
                    <label htmlFor="patientExamDate">Data do Exame</label>
                    <input 
                      className={ styles["patient__form-input"] } 
                      type="date" 
                      name="patientExamDate" 
                      id="patientExamDate" 
                      value={ result.data_exame.split('T')[0] }
                      onChange={ (e) => handleResultChange(examDate, index, 'data_exame', e.target.value) }
                    />
                  </div>

                  <div 
                    className={ `${styles["patient__form-section"]} ${styles["patient__form-section-icon-wrapper"]}` }
                    onClick={ () => openDeleteConfirmationModal(examDate, index) }
                  >
                    <FaTrash size={returnIconSizeByWindowSize()}/>
                  </div>
                </div>
              ))
            }                     
          </fieldset>
        ))
      }
    </>
  )
}
