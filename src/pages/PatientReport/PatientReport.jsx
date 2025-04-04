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
    
    setPatient({
      nome: responsePaciente.nome,
      sexo: responsePaciente.sexo,
      data_nascimento: responsePaciente.data_nascimento.split('T')[0],
      resultados: responsePaciente.resultados,
      exames: responsePaciente.exames,
    });
  }

  function handleEditbuttonClick() {
    navigate(`/patients/edit/${patientId}`, { replace: true });
  }

  function handleDeletebuttonClick() {
    setConfirmationModal({
      message: 'Tem certeza que deseja excluir esse paciente?',
      show: true,
    });
  }

  async function handleDeletePatient() {
    await axios.delete(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/patients/${patientId}`); 
    navigate('/exams/list', { replace: true });
    setConfirmationModal({
      ...confirmationModal,
      show: false,
    });
  }

  useEffect(() => {
    if(!addPatientResultModal) {
      getPatientByRouteId();
    }
  }, [addPatientResultModal]);

  return (
    <main className={ `wrapper ${styles["patient"]}` }>
      <AddPatientResultModal pacienteId={ patientId }/>

      <ConfirmationModal onConfirm={ handleDeletePatient }/>
      
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
              <Link to="/exams/list" state={{ contentTobeShown:'Pacientes' }} className={ styles["patient__info-back"] }>
                <FaArrowLeft size={ returnIconSizeByWindowSize() } />
                <span>Lista de Exames</span>
              </Link>

              <div className={ styles["patient__info-top"] }>
                <h1>{ patient.nome }</h1>
                
                <div className={ `${styles["patient__info-options"]} ${styles["patient__info-options--desktop"]}` }>
                  <button className={ styles["patient__info-options-edit"] } onClick={ handleEditbuttonClick}>
                    Editar
                    <FaRegEdit size={ returnIconSizeByWindowSize() } />
                  </button>

                  <button
                    className={ styles["patient__info-options-delete"] }
                    onClick={ handleDeletebuttonClick}  
                  >
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

              <div className={ `${styles["patient__info-options"]} ${styles["patient__info-options--no-desktop"]}` }>
                <button className={ styles["patient__info-options-edit"] } onClick={ handleEditbuttonClick}>
                  Editar
                  <FaRegEdit size={ returnIconSizeByWindowSize() } />
                </button>

                <button
                  className={ styles["patient__info-options-delete"] }
                  onClick={ handleDeletebuttonClick}  
                >
                  Excluir
                  <FaTrash size={ returnIconSizeByWindowSize() } />
                </button>
              </div>
            </section>

            <PatientResults 
              patient={ patient } 
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

function PatientResults({ patient, setExamNameTobeReferenced, setResultsTobeReferenced }) {
  const [ _, setAddPatientResultModal ] = useAtom(AddPatientResultModalAtom);
  const [ __, setShowExamResultsRefereceTableModal ] = useAtom(ExamResultsRefereceTableModalAtom);
  const [ groupedResults, setGroupedResults ] = useState({});
  const [ groupByCategory, setGroupByCategory ] = useState('data');

  const resultsWrapperRefs = useRef([]);

  function handleGroupByValueChange(e) {
    setGroupByCategory(e.target.value);
  }

  function groupResultsByDate() {    
    const formatedPacienteResults = {};
    patient.resultados.forEach(result => {
      const [ exam ] = patient.exames.filter(exame => exame.id === result.exame_id);
      const examDate = result.data_exame.split('T')[0];
      const formatedResult = {
        nome_exame: exam.nome,
        unidade_exame: exam.unidade,
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
    setGroupedResults(formatedPacienteResults);
  }
  
  function groupResultsByExam() {
    const pacienteResultsGroupedbyExam = {};
    patient.resultados.forEach(result => {
      const [ exam ] = patient.exames.filter(exame => exame.id === result.exame_id);
      const examName = exam.nome;
      const formatedResult = {
        nome_exame: examName,
        unidade_exame: exam.unidade,
        data_exame: result.data_exame.split('T')[0],
        valores_referencia: exam.resultados.filter(r => r.sexo === 'ambos' || r.sexo === 'm'),
        resultado: result.resultado
      };

      if(pacienteResultsGroupedbyExam[examName]) {
        pacienteResultsGroupedbyExam[examName].push(formatedResult);
      }
      else {
        pacienteResultsGroupedbyExam[examName] = [formatedResult];
      }
      setGroupedResults(pacienteResultsGroupedbyExam);
    });
  }

  function pushResultsWrapperRef(el) {
    resultsWrapperRefs.current.push(el);
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

  function handleAddNewPatientResultClick() {
    setAddPatientResultModal(true);
  }

  useEffect(() => {
    if(groupByCategory === 'data') {
      groupResultsByDate();
    }
    else if(groupByCategory === 'exame') {
      groupResultsByExam();
    }
  }, [groupByCategory])
  
  return (
    <section className={ styles["patient__results-list"] }>
      <div className={ styles["patient__results-titles"] }>
        <h2>Resultados</h2>

        <button className={ styles["patient__results-add-button"] } onClick={ handleAddNewPatientResultClick }>
          <FaCirclePlus />
          Adicionar Resultado
        </button>
      </div>

      <div className={ styles["patient__results-groupby"] }>
        <label htmlFor="groupBy">Agrupar Por:</label>
        <select 
          id="groupBy"
          onChange={ handleGroupByValueChange }
          value={ groupByCategory }
          className={ styles["patient__results-groupby-select"] }
        >
          <option value="data">Data</option>
          <option value="exame">Exame</option>
        </select>
      </div>

      {
        Object.keys(groupedResults).length === 0 ?
        <p>Nenhum resultado cadastrado</p> :
        Object.keys(groupedResults).map((key, index) => (
          <div 
            key={ index } 
            ref={ pushResultsWrapperRef }
            className={ `${styles["patient__results-wrapper"]} ${index === 0 ? styles["patient__results-wrapper--open"] : ''}` } 
          >
            <div className={ styles["patient__results-header"] } onClick={ handleOpenAccordion }>
              <h3 className={ styles["patient__results-title"] }>{ groupByCategory === 'data' ? returnFormatedDate(key) : key }</h3>

              <FaChevronDown size={ returnIconSizeByWindowSize() }/>
            </div>

            <div className={ styles["patient__results"] }>
              {
                groupedResults[key].map((result, index) => (
                  <button key={ index } className={ styles["patient__result"] } onClick={ () => handleExamClick(result)}>
                    <p className={ styles["patient__result-exam"] }>{ groupByCategory === 'data' ? result.nome_exame : returnFormatedDate(result.data_exame) }</p>
                    
                    <div className={ styles["patient__result-values"] }>
                      <p className={ styles["patient__result-value"] }>
                        { result.resultado }{ result.unidade_exame } {' '}
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

      {/* {
        (() => {
          switch(groupByCategory) {
            case 'data':
              return <PatientResultsGroupedbyDate
                resultados={ groupedResults } 
                setExamNameTobeReferenced={ setExamNameTobeReferenced }
                setResultsTobeReferenced={ setResultsTobeReferenced }
              />
            case 'exame':
              return <PatientResultsGroupedbyExam
                resultados={ groupedResults } 
                setExamNameTobeReferenced={ setExamNameTobeReferenced }
                setResultsTobeReferenced={ setResultsTobeReferenced }
              />
          }
      })()
      } */}
    </section>
  );
}