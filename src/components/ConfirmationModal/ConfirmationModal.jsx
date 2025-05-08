import styles from './styles.module.css';
import { FaXmark } from 'react-icons/fa6';
import { useAtom } from 'jotai';
import { ConfirmationModalAtom, IconSizeAtom } from '../../jotai';
import { returnIconSizeByWindowSize } from '../../utils';
import { useEffect, useRef } from 'react';
import Backdrop from '../Backdrop';

export default function ConfirmationModal({ message, onConfirm }) {
  const confirmButtonRef = useRef(null);
  const [ confirmationModal, setConfirmationModal ] = useAtom(ConfirmationModalAtom);
  const [ iconSize, setIconSize ] = useAtom(IconSizeAtom);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setIconSize(returnIconSizeByWindowSize());
    })
  }, []);

  function returnShowClass() {
    if (confirmationModal.show) {
      return styles['modal--show'];
    }
  }

  function handleConfirmButtonClick(e) {
    setConfirmationModal({
      ...confirmationModal,
      show: false
    });
    onConfirm(e, confirmButtonRef);
  } 

  function handleModalCloseButtonClick() {
    setConfirmationModal({
      ...confirmationModal,
      show: false
    });
  } 

  return (
    <>
      {
        confirmationModal.show ?
        <Backdrop onClick={ handleModalCloseButtonClick } />
        : null
      }

      <div className={ `${styles['modal']} ${ returnShowClass() }` }>
        <div className={ styles['modal__header']}>
          <h2>Cuidado!</h2>

          <div className={ styles['modal__header-icon-wrapper']} onClick={ handleModalCloseButtonClick}>
            <FaXmark size={ iconSize }/>
          </div>
        </div>

        <div className={ styles['modal__body']}>
          <p className={ styles['modal__message'] }>{ confirmationModal.message }</p>
          <span className={ styles['modal__message'] } >Esta ação não poderá ser desfeita.</span>
        </div>

        <div className={ styles['modal__actions'] }>
          <button 
            type="button" 
            className={ styles['modal__cancel'] }
            onClick={ handleModalCloseButtonClick }
          >
            Cancelar
          </button>

          <button 
            ref={ confirmButtonRef }
            type="button" 
            className={ styles['modal__confirm'] }
            onClick={(e) => handleConfirmButtonClick(e) }
          >
            Confirmar
          </button>
        </div>
      </div>
    </>
  );
}