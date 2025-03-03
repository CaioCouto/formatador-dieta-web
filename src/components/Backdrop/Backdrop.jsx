import { Children } from "react";
import styles from './styles.module.css';

export default function Backdrop({ className, onClick, ref, children }) {
  
  return (
    <div className={ `${styles['backdrop']} ${className}` } onClick={ onClick } ref={ ref }>
      { children }
    </div>
  );
}