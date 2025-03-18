import styles from "./styles.module.css";
import axios, { all, Axios } from "axios";
import { useEffect, useRef, useState } from "react";
import { FaCheck, FaCircleCheck, FaDownload, FaEye, FaUpload, FaXmark } from "react-icons/fa6";
import { Alert, Backdrop, Loader } from "../../components";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../utils";
import { FileUploadError } from "../../classes";
import { useAtom } from "jotai";
import { ExamReaderAddExamAtom, IconSizeAtom, ShowBackdropAtom } from "../../jotai";
import { AddExamModal, ExamList } from "./ExamReaderComponents";

const optionButtons = [
  { label: 'Exames' },
  { label: 'Pacientes' }
]

export default function ExamReader() {
  const [ openAddExamModal, setOpenaddExamModal ] = useAtom(ExamReaderAddExamAtom);
  const [ contentTitle, setContentTitle ] = useState('Exames');

  function handleAddExamClick(e) {
    // setOpenaddExamModal(true);
    setContentTitle(e.target.dataset.label)
  }

  return (
    <main className={ `wrapper ${styles["examreader"]}` }>
      <h1 className={ styles["examreader__title"] }>Leitor de Exames</h1>

      <section className={ styles["examreader__content-wrapper"] }>
        <aside className={ styles["examreader__options"] }>
          {
            optionButtons.map((option, index) => (
              <button key={ index } onClick={ handleAddExamClick } data-label={ option.label }>{ option.label }</button>
            ))
          }
        </aside>

        <div className={ styles["examreader__content"] }>
          <ExamList />
        </div>
      </section>


      <AddExamModal />
    </main>
  );
}

