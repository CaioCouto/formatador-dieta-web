import { FaCircleCheck, FaCircleExclamation, FaCircleXmark } from 'react-icons/fa6';
import styles from './styles.module.css';

let openClass;

export default function Alert({ message, type, show }) {
  const classesByType = {
    'success': {
      class: 'success',
      icon: <FaCircleCheck size={ 24 }/>
    },
    'info': {
      class: 'info',
      icon: <FaCircleExclamation size={ 24 }/>
    },
    'error': {
      class: 'error',
      icon: <FaCircleXmark size={ 24 }/>
    }
  };

  return (
    <div className={ styles['alert'] + ` ${show ? styles['alert--open'] : ''} ` + styles[`alert--${classesByType[type].class}`] }>
      { classesByType[type].icon }
      <p className={ styles['alert__message'] }>{ message }</p>
    </div>
  );
}