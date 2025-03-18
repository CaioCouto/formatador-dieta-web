import styles from './styles.module.css';
import { FaCircleCheck, FaCircleExclamation, FaXmark } from 'react-icons/fa6';
import { useAtom } from 'jotai';
import { ConfirmationModalAtom, ExamResultsRefereceTableModalAtom, IconSizeAtom } from '../../jotai';
import { returnExamResultsIntervals, returnIconSizeByWindowSize } from '../../utils';
import { useEffect, useRef, useState } from 'react';
import Backdrop from '../Backdrop';

export default function ExamResultsRefereceTableModal({ results }) {
  const confirmButtonRef = useRef(null);
  const [ showExamResultsRefereceTableModal, setShowExamResultsRefereceTableModal ] = useAtom(ExamResultsRefereceTableModalAtom);
  const [ iconSize, setIconSize ] = useAtom(IconSizeAtom);
  const [ formatedResults, setFormatedResults ] = useState([]);
  
  function generateFormatedResults() {
    if (results.length === 2) {
      const lastPos = results.length - 1;
      results.splice(1, 0, {
        id: null,
        exame_id: results[lastPos].exame_id,
        valor: results[lastPos].valor,
        resultado: 'Ideal'
      });
    }
    setFormatedResults(results);
  } 

  useEffect(() => {
    window.addEventListener('resize', () => {
      setIconSize(returnIconSizeByWindowSize());
    })
  }, []);

  useEffect(() => {
    generateFormatedResults();
  }, [results]);

  function handleModalCloseButtonClick() {
    setShowExamResultsRefereceTableModal(false);
  } 

  return (
    <>
      <Backdrop
        className={styles["editor__form-backdrop"]}
        onClick={ handleModalCloseButtonClick }
      />
      <div className={ styles['modal'] }>
        <div className={ styles['modal__header']}>
          <h2>Valores de Referência</h2>

          <div className={ styles['modal__header-icon-wrapper']} onClick={ handleModalCloseButtonClick}>
            <FaXmark size={ iconSize }/>
          </div>
        </div>

        <div className={ styles['modal__body']}>
          <table className={ styles["modal__table"] }>
            <thead>
              <tr>
                <th>Valor</th>
                <th>Classificação</th>
              </tr>
            </thead>
            <tbody>
              {
                formatedResults.map((result, index) => (
                  <tr key={ index } className={ styles["modal__table-row"] }>
                    <td >
                      { returnExamResultsIntervals(formatedResults, index) }
                    </td>
                    <td>{ result.resultado }</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}