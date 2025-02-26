import styles from './styles.module.css';
import { FaCircleCheck, FaCircleExclamation, FaCircleXmark } from 'react-icons/fa6';
import { useAtom } from 'jotai';
import { IconSizeAtom } from '../../jotai';
import { returnIconSizeByWindowSize } from '../../utils';
import { useEffect } from 'react';

export default function Alert({ message, type, show }) {
  const [ iconSize, setIconSize ] = useAtom(IconSizeAtom);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setIconSize(returnIconSizeByWindowSize());
    })
  }, []);

  const classesByType = {
    'success': {
      class: 'success',
      icon: <FaCircleCheck size={ iconSize }/>
    },
    'info': {
      class: 'info',
      icon: <FaCircleExclamation size={ iconSize }/>
    },
    'error': {
      class: 'error',
      icon: <FaCircleXmark size={ iconSize }/>
    }
  };

  return (
    <div className={ styles['alert'] + ` ${show ? styles['alert--open'] : ''} ` + styles[`alert--${classesByType[type].class}`] }>
      { classesByType[type].icon }
      <p className={ styles['alert__message'] }>{ message }</p>
    </div>
  );
}