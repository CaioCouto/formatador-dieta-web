import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ConfirmationModalAtom, ExamReaderAddExamAtom } from "../../../../jotai";
import { Alert, ConfirmationModal, Loader, RefereceTable } from "../../../../components";

import styles from './styles.module.css';
import { FaMagnifyingGlass, FaTrash } from "react-icons/fa6";
import { returnIconSizeByWindowSize, searchTermOnHTMLElement } from "../../../../utils";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import AddExamModal from "../AddExamModal/AddExamModal";
import { Exams } from "../../../../classes";

const examsController = new Exams();

export default function ExamList() {
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ openAddExamModal, setOpenaddExamModal ] = useAtom(ExamReaderAddExamAtom);
  
  const searchBoxRef = useRef(null);
  const examNameParagraphs = useRef([]);

  const [ loading, setLoading ] = useState(false);
  const [ exams, setExams ] = useState([]);
  const [ examIdToBeDeleted, setExamIdToBeDeleted ] = useState(null);
  const [ alert, setAlert ] = useState({
    message: 'test',
    type: 'success',
    show: false
  });

  async function getAllExams() {
    setLoading(true);
    const response = await examsController.getAll();

    if (response.status !== 200) {
      setExams([]);
      return;
    }

    setExams(response.data);
    setLoading(false);
  }

  function handleOpenAddExamModal(e) {
    setOpenaddExamModal(true);
  }

  function populateExamNameParagraphsRefs(el) {
    examNameParagraphs.current.push(el)
  }

  function handleSearchTermChange(e) {
    examNameParagraphs.current.forEach(el => {
      if (!el) { return; }
      const termExists = searchTermOnHTMLElement(e.target.value, el, 'examName');
      el.style.display = termExists ? 'block' : 'none';
    });
  }

  function handleOpenSeachBox() {
    const searchBoxClasslist = searchBoxRef.current.classList;
    const openClass = styles['examlist__searchbox--open'];

    if(searchBoxClasslist.contains(openClass)) {
      searchBoxClasslist.remove(openClass);
    }
    else {
      searchBoxClasslist.add(openClass);
    }
  }

  async function deleteExam() {
    try {
      setLoading(true);
      setConfirmationModal({
        ...confirmationModal,
        show: false,
      });

      setAlert({
        message: 'Deletando exame...',
        type: 'info',
        show: true
      });

      await axios.delete(`${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/exams/${examIdToBeDeleted}`);
      
      const newExams = exams.filter((exam, i) => exam.id !== examIdToBeDeleted);
      setExams(newExams);

      setAlert({
        message: 'Exame Deletado com sucesso!',
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
        });
      }, 5000);
    }
  }

  useEffect(() => { getAllExams(); }, []);

  return (
    <section className={ styles["examlist"] }>
      <ConfirmationModal
        message={ confirmationModal.message }
        onConfirm={ deleteExam }
      />
      <AddExamModal /> 


      <div  className={ styles["examlist__header"] }>
        <h2 className={ styles["examlist__title"] }>Exames</h2>

        <div className={ styles["examlist__options"] }>
          <button className={ styles["examlist__options-search"] } onClick={ handleOpenSeachBox }>
            <FaMagnifyingGlass size={ returnIconSizeByWindowSize() } />
          </button>
          <button onClick={ handleOpenAddExamModal }>Adicionar Exame</button>
        </div>
      </div>

      <div ref={ searchBoxRef } className={ styles["examlist__searchbox"] }>
        <input 
          type="text" 
          placeholder="Nome do Exame..." 
          className={ styles["examlist__searchbox-input"] } 
          onChange={ handleSearchTermChange } 
        />
      </div>

      <Alert 
        message={ alert.message }
        type={ alert.type }
        show={ alert.show }
      />

      <div className={ styles["examlist__exams-wrapper"] }>
        {
          loading ?
          <Loader /> :
          <List 
            exams={ exams } 
            setExamIdToBeDeleted={ setExamIdToBeDeleted }
            populateExamNameParagraphsRefs={ populateExamNameParagraphsRefs }
          />
        }
      </div>
    </section>
  );
}

function List({ exams, setExamIdToBeDeleted, populateExamNameParagraphsRefs }) {
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  

  async function openDeleteConfirmationModal(examId) {
    setExamIdToBeDeleted(examId);
    setConfirmationModal({
      show: true,
      message: 'Tem certeza que deseja deletar este exame?',
    });
  }

  return (
    <>
      {
        exams.length === 0 ?
        <p className={ styles["examlist__no-exams"] }>Nenhum exame cadastrado</p> :
        exams.map((exam, index) => (
          <div ref={ populateExamNameParagraphsRefs } className={ styles["examlist__exam"] } key={ index }>
            <div className={ styles["examlist__exam-info"] }>
              <div className={ styles["examlist__exam-info-text"] }>
                <p className={ `examName ${styles["examlist__exam-name"]}` }>{ exam.nome }</p>
                <p className={ styles["examlist__exam-description"] }> ({ exam.resultados_exames.length } resultados)</p>
              </div>

              <div className={ styles["examlist__exam-options"] }>
                <Link to={ `/exams/${exam.id}` }>
                  <FaRegEdit 
                    size={ returnIconSizeByWindowSize() }
                    className={ styles["examlist__edit-icon"] }
                  />
                </Link>
                <FaTrash 
                  size={ returnIconSizeByWindowSize() }
                  className={ styles["examlist__delete-icon"] }
                  onClick={(e) => openDeleteConfirmationModal(exam.id) }
                />
              </div>
            </div>

            {
              exam.resultados_exames.length === 0 ?
              <div className={ styles["examlist__exam-results"] }>
                <p>Este exame ainda não possui resultados cadastrados.</p>
              </div> :
              <div className={ styles["examlist__exam-results"] }>
                <RefereceTable
                  results={ exam.resultados_exames }
                  unit={ exam.unidade }
                  tableClassName={ styles["examlist__exam-table"] }
                  tableRowClassName={ styles["examlist__exam-table-row"]}
                  tableDataClassName={ styles["examlist__exam-table-data"]}
                />
              </div>
            }
          </div>
        ))
    }
    </>
  )
}