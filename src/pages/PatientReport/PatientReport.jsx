import styles from "./styles.module.css";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaChevronDown, FaCirclePlus, FaTrash } from "react-icons/fa6";
import { Alert, ConfirmationModal, ExamResultsRefereceTableModal, Loader } from "../../components";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../utils";
import { useAtom } from "jotai";
import { AddPatientResultModalAtom, ConfirmationModalAtom, ExamResultsRefereceTableModalAtom } from "../../jotai";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { AddPatientResultModal } from "./PatientReportComponents";
import { Patients } from "../../classes";

const patientsController = new Patients();

function returnExtractedNumbersFromResultValue(value) {
  value = value.replace(/[,.]/g, '.');
  let numbers = value.match(/\d*\.*\d*/g);
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
  const todayMonth = today.getMonth() + 1;
  const age = today.getFullYear() - Number(birthYear);
  const birthdayHasPassed = todayDate >= Number(birthDay) && todayMonth >= Number(birthMonth);
  
  return birthdayHasPassed ? age : age - 1;
}

function returnPatientResultClassification(valor, valoresReferencia) {
  let classification = 'alterado';

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
      if(valor >= refValueNumbers[0] && valor <= refValueNumbers[1]) {
        classification = ref.resultado;
      }
    }
    else {
      if(valor === refValueNumbers) { classification = ref.resultado; }
    }
  });

  return classification;
}

function returnFormatedResult(result, patientGender) {
  const valores_referencia = result.exames.resultados_exames.filter(r => r.sexo === 'ambos' || r.sexo === patientGender);
  const formatedResult = {
    nome_exame: result.nome_exame,
    unidade_exame: result.unidade_exame,
    data_exame: result.data_exame,
    valores_referencia: valores_referencia,
    resultado: result.resultado,
    classification: returnPatientResultClassification(result.resultado, valores_referencia)
  };

  formatedResult['shouldBeHighlighted'] = formatedResult.classification.toLowerCase() !== 'ideal';
  return formatedResult;
}

function orderResultsByExamDate(results){
  return results.sort((a, b) => new Date(b.data_exame) - new Date(a.data_exame));
}

function orderResultsByName(results){
  return results.sort((a, b) => a.nome_exame.localeCompare(b.nome_exame, 'pt-br'));
}

export default function PatientReport() {
  const patientId = Number(useParams('id').id);
  const navigate = useNavigate();
  const [ addPatientResultModal, setAddPatientResultModal ] = useAtom(AddPatientResultModalAtom);
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ loading, setLoading ] = useState(true);
  const [ resultsTobeReferenced, setResultsTobeReferenced ] = useState(null);
  const [ examNameTobeReferenced, setExamNameTobeReferenced ] = useState(null);
  const [ alert, setAlert ] = useState({
    message: 'Nothing yet...',
    type: 'success',
    show: false
  });

  const [ patient, setPatient ] = useState(null); 

  async function getPatientByRouteId() {
    setLoading(true);
    const response = await patientsController.getPatientById(patientId);

    if(response.status !== 200) {
      showAlertComponent(
        `${response.message} Redirecionando para a lista de pacientes...`,
        'error',
        true,
        setAlert
      );
      setTimeout(() => {navigate('/patients', { replace: true }); }, 3000);
      return;
    }
    
    const responsePaciente = response.data;

    let formatedPacienteResults = responsePaciente.resultados_pacientes.map(r => {
      r.nome_exame = r.exames.nome;
      r.unidade_exame = r.exames.unidade;
      r.data_exame = r.data_exame.split('T')[0];
      return r;
    });
    
    setPatient({
      nome: responsePaciente.nome,
      sexo: responsePaciente.sexo,
      data_nascimento: responsePaciente.data_nascimento.split('T')[0],
      resultados: formatedPacienteResults,
      exames: responsePaciente.exames,
    });
    
    setLoading(false);
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
    showAlertComponent(
      'Excluindo paciente...',
      'info',
      true,
      setAlert
    );

    const response = await patientsController.deletePatient(patientId);

    if(response.status !== 200) {
      showAlertComponent(
        response.message,
        'error',
        true,
        setAlert
      );
      return;
    }

    showAlertComponent(
      'Paciente excluído com sucesso! Redirecionando para lista de pacientes...',
      'success',
      true,
      setAlert
    );
    setTimeout(() => {navigate('/patients', { replace: true, state: { contentTobeShown: 'Pacientes' } }); }, 3000);
  }

  useEffect(() => {
    if(!addPatientResultModal) {
      getPatientByRouteId();
    }
  }, [addPatientResultModal]);

  return (
    <main className={ `wrapper ${styles["patient"]}` }>
      <Alert
        message={ alert.message }
        type={ alert.type }
        show={ alert.show }
      />

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
        loading ? 
          <Splash /> :
          <>
            <section className={ styles["patient__info"] }>
              <Link to="/patients" className={ styles["patient__info-back"] }>
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
    const orderedResults = orderResultsByExamDate(patient.resultados);
    orderedResults.forEach(result => {
      const formatedResult = returnFormatedResult(result, patient.sexo);
      
      if(formatedPacienteResults[result.data_exame]) {
        formatedPacienteResults[result.data_exame].push(formatedResult);
      }
      else {
        formatedPacienteResults[result.data_exame] = [formatedResult];
      }
    });
    Object.keys(formatedPacienteResults).forEach(key => {
      formatedPacienteResults[key] = orderResultsByName(formatedPacienteResults[key]);
    })
    setGroupedResults(formatedPacienteResults);
  }
  
  function groupResultsByExam() {
    const pacienteResultsGroupedbyExam = {};
    const orderedResults = orderResultsByName(patient.resultados);
    orderedResults.forEach(result => {
      const formatedResult = returnFormatedResult(result, patient.sexo);
      
      if(pacienteResultsGroupedbyExam[result.nome_exame]) {
        pacienteResultsGroupedbyExam[result.nome_exame].push(formatedResult);
      }
      else {
        pacienteResultsGroupedbyExam[result.nome_exame] = [formatedResult];
      }
    });
    setGroupedResults(pacienteResultsGroupedbyExam);
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
          <FaCirclePlus size={ returnIconSizeByWindowSize() }/>
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
                  <button key={ index } className={ `${styles["patient__result"]} ${result.shouldBeHighlighted ? styles["patient__result--highlighted"] : '' }` } onClick={ () => handleExamClick(result)}>
                    <p className={ styles["patient__result-exam"] }>{ groupByCategory === 'data' ? result.nome_exame : returnFormatedDate(result.data_exame) }</p>
                    
                    <div className={ styles["patient__result-values"] }>
                      <p className={ styles["patient__result-value"] }>
                        { String(result.resultado).replace('.', ',') }{ result.unidade_exame } {' '}
                        <span>({ result.classification })</span>
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