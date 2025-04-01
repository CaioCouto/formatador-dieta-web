import styles from "./styles.module.css";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaCheck, FaChevronDown, FaCirclePlus, FaPencil, FaTrash, FaXmark } from "react-icons/fa6";
import { Alert, ConfirmationModal, ExamResultsRefereceTableModal, Loader } from "../../components";
import { returnIconSizeByWindowSize } from "../../utils";
import { useAtom } from "jotai";
import { AddPatientResultModalAtom, ConfirmationModalAtom, ExamResultsRefereceTableModalAtom, IconSizeAtom } from "../../jotai";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { EmptyExamNameError, EmptyExamResultsError } from "../../classes";
import { AddPatientResultModal } from "./PatientReportComponents";


function returnExtractedNumbersFromResultValue(value) {
  let numbers = value.match(/\d*/g);
  if(numbers) {
    return numbers.filter(n => !!n).map(n => Number(n));
  }
}

function returnFormatedDate(date) {
  return date.split('-').reverse().join('/');
}

function returnPatientAge(birthdate) {
  const splittedBirthdate = birthdate.split('-');
  const [ birthYear, birthMonth, birthDay ] = splittedBirthdate;
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const age = today.getFullYear() - Number(birthYear);
  const birthdayHasPassed = todayDate >= Number(birthDay) && todayMonth >= Number(birthMonth);
  
  return birthdayHasPassed ? age : age - 1;
}

function returnPatientResultClassification(result) {
  let classification = 'alterado';
  const valor = result.resultado;
  const valoresReferencia = result.valores_referencia;

  valoresReferencia.forEach((ref) => {
    if(classification && classification !== 'alterado') { return; }
    let refValue = ref.valor;
    let refValueNumbers = returnExtractedNumbersFromResultValue(refValue);
    if(refValue.includes('≤')) {
      if(valor <= refValueNumbers) { classification = ref.resultado; }
    }
    else if (refValue.includes('<')) {
      if(valor < refValueNumbers) { classification = ref.resultado; }      
    }
    else if (refValue.includes('≥')) {
      if(valor >= refValueNumbers) { classification = ref.resultado; }      
    }
    else if (refValue.includes('>')) {
      if(valor >= refValueNumbers) { classification = ref.resultado; }      
    }
    else if (refValue.includes('-')) {
      if(valor > refValueNumbers[0] && valor <= refValueNumbers[1]) {
        classification = ref.resultado;
      }
    }
  });

  return classification;
}

export default function PatientReport() {
  const patientId = Number(useParams('id').id);
  const navigate = useNavigate();
  const [ addPatientResultModal, setAddPatientResultModal ] = useAtom(AddPatientResultModalAtom);
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ showExamResultsRefereceTableModal, setShowExamResultsRefereceTableModal ] = useAtom(ExamResultsRefereceTableModalAtom);
  const [ loading, setLoading ] = useState(false);
  const [ resultsTobeReferenced, setResultsTobeReferenced ] = useState(null);
  const [ examNameTobeReferenced, setExamNameTobeReferenced ] = useState(null);
  const [ alert, setAlert ] = useState({
    message: 'Nothing yet...',
    type: 'success',
    show: false
  });

  const [ patient, setPatient ] = useState(null); 

  async function getPatientByRouteId() {
    let responsePaciente = await axios.get(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/patients/${patientId}`);
    responsePaciente = responsePaciente.data;
    const formatedPacienteResults = {};
    responsePaciente.resultados.forEach(result => {
      const [ exam ] = responsePaciente.exames.filter(exame => exame.id === result.exame_id);
      const examDate = result.data_exame.split('T')[0];
      const formatedResult = {
        nome_exame: exam.nome,
        data_exame: result.data_exame.split('T')[0],
        valores_referencia: exam.resultados.filter(r => r.sexo === 'ambos' || r.sexo === 'm'),
        resultado: result.resultado
      };

      if(formatedPacienteResults[examDate]) {
        formatedPacienteResults[examDate].push(formatedResult);
      }
      else {
        formatedPacienteResults[examDate] = [formatedResult];
      }
    });
    
    setPatient({
      nome: responsePaciente.nome,
      sexo: responsePaciente.sexo,
      data_nascimento: responsePaciente.data_nascimento.split('T')[0],
      resultados: formatedPacienteResults
    });
  }

  function handleEditbuttonClick() {
    navigate(`/patients/edit/${patientId}`, { replace: true });
  }

  useEffect(() => {
    if(!addPatientResultModal) {
      getPatientByRouteId();
    }
  }, [addPatientResultModal]);

  return (
    <main className={ `wrapper ${styles["patient"]}` }>
      <AddPatientResultModal pacienteId={ patientId }/>
      
      {
        resultsTobeReferenced ? 
        <ExamResultsRefereceTableModal 
          examName={ examNameTobeReferenced } 
          results={ resultsTobeReferenced }
        />
        : null
      }

      {
        !patient ? 
          <Splash /> :
          <>
            <section className={ styles["patient__info"] }>
              <Link to="/exams/list" className={ styles["patient__info-back"] }>
                <FaArrowLeft size={ returnIconSizeByWindowSize() } />
                <span>Lista de Exames</span>
              </Link>

              <div className={ styles["patient__info-top"] }>
                <h1>{ patient.nome }</h1>
                
                <div className={ styles["patient__info-options"] }>
                  <button className={ styles["patient__info-options-edit"] } onClick={ handleEditbuttonClick}>
                    Editar
                    <FaRegEdit size={ returnIconSizeByWindowSize() } />
                  </button>

                  <button className={ styles["patient__info-options-delete"] }>
                    Excluir
                    <FaTrash size={ returnIconSizeByWindowSize() } />
                  </button>
                </div>
              </div>
              <p>
                Sexo:{' '}
                <strong>
                  { patient.sexo === 'm' ? 'Masculino' : 'Feminino' }
                </strong>
              </p>
              <p>
                Data de Nascimento:{' '}
                <strong>
                  { returnFormatedDate(patient.data_nascimento) }{' '}
                  ({ returnPatientAge(patient.data_nascimento) } anos)
                </strong>
              </p>
            </section>

            <PatientResults 
              resultados={ patient.resultados } 
              setExamNameTobeReferenced={ setExamNameTobeReferenced }
              setResultsTobeReferenced={ setResultsTobeReferenced }
            />
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

function PatientResults({ resultados, setExamNameTobeReferenced, setResultsTobeReferenced }) {
  const [ addPatientResultModal, setAddPatientResultModal ] = useAtom(AddPatientResultModalAtom);
  const [ _, setShowExamResultsRefereceTableModal ] = useAtom(ExamResultsRefereceTableModalAtom);

  const resultsWrapperRefs = useRef([]);

  function pushResultsWrapperRef(el) {
    resultsWrapperRefs.current.push(el);
  }

  function handleAddNewPatientResultClick() {
    setAddPatientResultModal(true);
  }

  function handleExamClick(result) {
    setShowExamResultsRefereceTableModal(true);
    setExamNameTobeReferenced(result.nome_exame);
    setResultsTobeReferenced(result.valores_referencia);
  }

  function handleOpenAccordion(e) {
    e.stopPropagation();
    const parentElementClassList = e.target.closest(`.${styles["patient__results-wrapper"]}`).classList;
    const parentElementOpenClass = styles["patient__results-wrapper--open"];
    const parentElementIsOpen = parentElementClassList.contains(parentElementOpenClass);

    resultsWrapperRefs.current.forEach((el) => {
      if(el) { 
        el.classList.remove(parentElementOpenClass); 
      }
    });

    if(parentElementIsOpen) { return; }

    parentElementClassList.add(parentElementOpenClass);

  }
  
  return (
    <section className={ styles["patient__results-list"] }>
      <div className={ styles["patient__results-titles"] }>
        <h2>Resultados</h2>

        <button className={ styles["patient__results-add-button"] } onClick={ handleAddNewPatientResultClick }>
          <FaCirclePlus />
          Adicionar Resultado
        </button>
      </div>
      {
        Object.keys(resultados).length === 0 ?
        <p>Nenhum resultado cadastrado</p> :
        Object.keys(resultados).map((key, index) => (
          <div 
            key={ index } 
            ref={ pushResultsWrapperRef }
            className={ `${styles["patient__results-wrapper"]} ${index === 0 ? styles["patient__results-wrapper--open"] : ''}` } 
          >
            <div className={ styles["patient__results-header"] } onClick={ handleOpenAccordion }>
              <h3>{ returnFormatedDate(key) }</h3>

              <FaChevronDown size={ returnIconSizeByWindowSize() }/>
            </div>

            <div className={ styles["patient__results"] }>
              {
                resultados[key].map((result, index) => (
                  <button key={ index } className={ styles["patient__result"] } onClick={ () => handleExamClick(result)}>
                    <p className={ styles["patient__result-exam"] }>{ result.nome_exame }</p>
                    
                    <div className={ styles["patient__result-values"] }>
                      <p className={ styles["patient__result-value"] }>
                        { result.resultado }{' '}
                        ({ returnPatientResultClassification(result) }) 
                      </p>
                    </div>
                  </button>
                ))
              }
            </div>
          </div>
        ))
      }
    </section>
  );
}

