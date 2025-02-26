import { Children } from "react";

export default function Backdrop({ className, children }) {
  
  return (
    <div className={ className }>
      { children }
    </div>
  );
}