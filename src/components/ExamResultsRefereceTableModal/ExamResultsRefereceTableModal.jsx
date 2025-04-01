import styles from './styles.module.css';
import { FaXmark } from 'react-icons/fa6';
import { useAtom } from 'jotai';
import { ExamResultsRefereceTableModalAtom, IconSizeAtom } from '../../jotai';
import { returnIconSizeByWindowSize } from '../../utils';
import { useEffect } from 'react';
import Backdrop from '../Backdrop';
import RefereceTable from '../RefereceTable';

export default function ExamResultsRefereceTableModal({ examName, results }) {  
  const [ showExamResultsRefereceTableModal, setShowExamResultsRefereceTableModal ] = useAtom(ExamResultsRefereceTableModalAtom);
  const [ iconSize, setIconSize ] = useAtom(IconSizeAtom);

  function returnShowClass() {
    if(showExamResultsRefereceTableModal) {
      return styles["modal--show"];
    }
  }

  function handleModalCloseButtonClick() {
    setShowExamResultsRefereceTableModal(false);
  }

  useEffect(() => {
    window.addEventListener('resize', () => {
      setIconSize(returnIconSizeByWindowSize());
    })
  }, []);

  return (
    <>
      {
        showExamResultsRefereceTableModal ?
        <Backdrop
          className={styles["editor__form-backdrop"]}
          onClick={ handleModalCloseButtonClick }
        />
        : null
      }
      <div className={`wrapper ${styles["modal"]} ${ returnShowClass() }`}>
        <div className={ styles['modal__header']}>
          <h2>Valores de Referência</h2>

          <div className={ styles['modal__header-icon-wrapper']} onClick={ handleModalCloseButtonClick }>
            <FaXmark size={ iconSize }/>
          </div>
        </div>

        <div className={ styles['modal__body']}>
          <h3  className={ styles['modal__exam-name']}>{ examName }</h3>
          <RefereceTable results={ results } />
        </div>
      </div>
    </>
  );
}