import styles from './styles.module.css';

export default function Backdrop({ onClick }) {
  
  return (
    <div className={ styles['backdrop'] } onClick={ onClick }></div>
  );
}