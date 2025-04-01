import styles from "./styles.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheck, FaCircleCheck, FaDownload, FaEye, FaUpload, FaXmark } from "react-icons/fa6";
import { Alert, Backdrop, Loader } from "../../components";
import { returnIconSizeByWindowSize, showAlertComponent } from "../../utils";
import { FileUploadError } from "../../classes/Error";
import { useAtom } from "jotai";
import { IconSizeAtom, ShowBackdropAtom } from "../../jotai";

async function generateLatex(formData) {
  const latexModel = await axios.post(
    import.meta.env.VITE_N8N_TEST_WEBHOOK_URL, 
    formData, 
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return latexModel.data;
}

async function generatePdfFromLatex(latexModel) {
  const pdf = await axios.post(
    `${import.meta.env.VITE_LOCALHOST_API_BASE_URL}/formatador`, 
    { dieta: latexModel },
    { responseType: 'blob' }
  );

  return pdf.data;
}

export default function Formatter() {
  const [ showBackdrop, setShowBackdrop ] = useAtom(ShowBackdropAtom);
  const [ iconSize, setIconSize ] = useAtom(IconSizeAtom);
  const [ file, setFile ] = useState(null);
  const [ previewFileURL, setPreviewFileURL ] = useState(null);
  const [ downloadFileURL, setDownloadFileURL ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ alert, setAlert ] = useState({
    message: 'teste',
    type: 'success',
    show: false
  });

  useEffect(() => {
    window.addEventListener('resize', () => {
      setIconSize(returnIconSizeByWindowSize());
    })
  }, []);

  function handleFileSelect(e) {
    const fileInput = document.querySelector('#dieta');
    fileInput.click();
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];

    try {
      if(selectedFile) {
        if (selectedFile.type !== 'application/pdf') {
          throw new FileUploadError( 'O arquivo selecionado não é um arquivo .pdf');
        }
        setFile(selectedFile);
        setPreviewFileURL(URL.createObjectURL(selectedFile));
        setDownloadFileURL(null);
      }
    } catch (error) {
      showAlertComponent(
        error.message,
        'error',
        true,
        setAlert
      );
    } finally {
      setTimeout(() => {
        showAlertComponent(
          alert.message,
          alert.type,
          false,
          setAlert
        );
      }, 5000);
    }
    
  }

  function handlOpenPreview(e) {
    setShowBackdrop(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if(!file) {
      showAlertComponent(
        'Um Arquivo .pdf deve ser selecionado', 
        'error', 
        true, 
        setAlert
      );

      setTimeout(() => {
        showAlertComponent(
          alert.message, 
          alert.type, 
          false,
          setAlert
        );
      }, 5000);

      return;
    }

    setLoading(true);

    showAlertComponent(
      'Gerando modelo LaTeX...', 
      'info', 
      true, 
      setAlert
    );

    try {
      const formData = new FormData();
      formData.append('dieta', file);

      const latexModel = await generateLatex(formData);

      showAlertComponent(
        'Gerando pdf...', 
        'info', 
        true, 
        setAlert
      );

      const dietfile = await generatePdfFromLatex(latexModel);

      setDownloadFileURL(window.URL.createObjectURL(dietfile));

      showAlertComponent(
        'Dieta formatada com sucesso!', 
        'success', 
        true, 
        setAlert
      );
    }
    catch(e) {
      console.log('oops')
      console.log(e.name);
      console.error(e);
      let alertMessage = 'Um erro ocorreu durante a formatação!';
      const errorName = e.name;
      if(errorName === 'AxiosError') {
        if(e.response) {
          console.log(e.response);
        }
      }

      showAlertComponent(
        alertMessage, 
        'error', 
        true, 
        setAlert
      );

    }
    finally {
      setLoading(false);

      setTimeout(() => {
        showAlertComponent(
          alert.message, 
          alert.type, 
          false,
          setAlert
        );
      }, 5000);
    }
  }

  return (
    <main className={ `wrapper ${styles['formatter']}` }>

      <form className={ `wrapper ${styles["formatter__form"]}` } onSubmit={ handleFormSubmit } noValidate>

        <section className={ `${styles['formatter__form-section']}` }>      
          <h1 className={ `${styles['formatter__form-title']}` }>Formatador de Dietas</h1>
        </section>

        <Alert 
          message={ alert.message }
          type={ alert.type }
          show={ alert.show }
        />

        <section className={ styles["formatter__form-section"] }>
          <label htmlFor="dieta" className={ styles["formatter__form-label"] }>Selecione uma dieta</label>
          <input 
            type="file" 
            name="dieta" 
            id="dieta" 
            accept="application/pdf" 
            className={ styles["formatter__form-file-input"] } 
            onChange={ handleFileChange }
            required 
          />
          <div className={ styles["formatter__file-upload-wrapper"] } onClick={ handleFileSelect }>
            {
              !file ?
              <FaUpload size={ iconSize } className={ styles["formatter__file-upload-icon"] }/> :
              <FaCircleCheck size={ iconSize } className={ styles["formatter__file-upload-icon--selected"] }/>
            }
            <div>
              <p className={ styles["formatter__file-upload-text"] }>
                {
                  !file ?
                  'Clique aqui para selecionar um arquivo':
                  file.name
                }
              </p>
            </div>
          </div>
        </section>
        

        {
          !loading ?
          <section className={ `${styles["formatter__form-section"]} ${styles["formatter__form-section-buttons"]}` }>
            <button type="submit" className={ `${styles["formatter__form-button"]} ${styles["formatter__form-submit"]}` }>
              <FaCheck size={ iconSize }/>
              Formatar
            </button>

            {
              !file ?
              null :
              <button 
                type="button" 
                className={ `${styles["formatter__form-button"]} ${styles["formatter__form-preview"]}` } 
                onClick={ handlOpenPreview }
              >
                <FaEye size={ iconSize }/>
                Preview
              </button>
            }
            
            {
              !downloadFileURL ?
              null:
              <a href={ downloadFileURL } download={ file.name } className={ `${styles["formatter__form-download"]}` }>
                <FaDownload size={ iconSize }/>
                Download
              </a>
            }
          </section>
          : <Loader />
        }
      </form>
      
      {
        !showBackdrop ?
        null :
        <PreviewModal 
          file={ file }
          downloadFileURL ={ downloadFileURL }
          previewFileURL={ previewFileURL }
          iconSize={ iconSize }
        />
      }
    </main>
  );
}

function PreviewModal({ file, downloadFileURL, previewFileURL, iconSize }) {
  const [ showBackdrop, setShowBackdrop ] = useAtom(ShowBackdropAtom);

  function handleCloseIconClick(e) {
    setShowBackdrop(false);
  }
 
  if(showBackdrop && (downloadFileURL || previewFileURL)) {
    return (
      <>
        <Backdrop className={ styles['formatter__pdf-backdrop'] } onClick={ handleCloseIconClick }/>
        <div className={ `wrapper ${styles["formatter__pdf-preview"]}` }>
          <div className={ `wrapper ${styles["formatter__pdf-preview-header"]}` }>
            <h2 className={ styles["formatter__pdf-preview-title"] }>{ file.name }</h2>
            <FaXmark size={ iconSize } className={ styles["formatter__pdf-preview-icon"] } onClick={ handleCloseIconClick }/>
          </div>
          <object data={ downloadFileURL? downloadFileURL : previewFileURL } type="application/pdf" width="100%" height="100%">
            <p>Alternative text - include a link <a href={ downloadFileURL? downloadFileURL : previewFileURL }>to the PDF!</a></p>
          </object>
        </div>
      </>
    );
  }
}