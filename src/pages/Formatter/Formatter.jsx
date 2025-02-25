import styles from "./styles.module.css";
import axios from "axios";
import { useState } from "react";
import { FaCircleCheck, FaUpload } from "react-icons/fa6";
import { Alert, Loader } from "../../components";
import { showAlertComponent } from "../../utils";
import { FileUploadError } from "../../classes/Error";

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
  const [ file, setFile ] = useState(null);
  const [ previewFileURL, setPreviewFileURL ] = useState(null);
  const [ downloadFileURL, setDownloadFileURL ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ alert, setAlert ] = useState({
    message: 'teste',
    type: 'success',
    show: false
  });

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

      const dietfile = generatePdfFromLatex(latexModel);

      setDownloadFileURL(window.URL.createObjectURL(dietfile.data));

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

      <section className={ `${styles['formatter__titles']}` }>      
      <h1>Formatador de Dietas</h1>
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
              <FaUpload size={ 25 } className={ styles["formatter__file-upload-icon"] }/> :
              <FaCircleCheck size={ 25 } className={ styles["formatter__file-upload-icon--selected"] }/>
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
        
        <section className={ `${styles["formatter__form-section"]} ${styles["formatter__form-section-buttons"]}` }>
          <button type="submit" className={ `${styles["formatter__form-submit"]}` }>Enviar</button>
          {
            !downloadFileURL ?
            null:
            <a href={ downloadFileURL } download={ file.name } className={ `${styles["formatter__form-download"]}` }>Download</a>
          }

          {
            !loading ?
            null:
            <Loader />
          }
        </section>
      </form>
        
      {
        !file && (!previewFileURL && !downloadFileURL) ?
        null :
        <div className={ styles["formatter__pdf-preview"] }>
          <h2 className={ styles["formatter__pdf-preview-title"] }>Pré-visualização: { file.name }</h2>
          <object data={ downloadFileURL? downloadFileURL : previewFileURL } type="application/pdf" width="100%" height="100%">
            <p>Alternative text - include a link <a href={ downloadFileURL? downloadFileURL : previewFileURL }>to the PDF!</a></p>
          </object>
        </div>
      }
    </main>
  );
}