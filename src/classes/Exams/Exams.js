import { axiosInstance } from "../../utils";


const userData = JSON.parse(localStorage.getItem("user_data"));
const access_token = userData ? userData.access_token : null;

export default class Exams {
  async getAll() {
    try {
      let allExams = await axiosInstance.get(
        `/exams`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      
      allExams = allExams.data.map(exam => {
        const resultados_grouped_by_gender = {};
        let resultados = exam.resultados_exames;
  
        resultados.forEach(resultado => {
          if(resultados_grouped_by_gender[resultado.sexo]) {
            resultados_grouped_by_gender[resultado.sexo].push(resultado);
          }
          else {
            resultados_grouped_by_gender[resultado.sexo] = [resultado];
          }
        });
  
        exam['resultados_grouped_by_gender'] = resultados_grouped_by_gender;
  
        return exam;
      });
  
      return {
        status: 200,
        data: allExams
      };
    } catch (error) {
      if(error.name === 'AxiosError') {
        if(error.response) {
          return {
            status: error.response.status,
            data: []
          };
        }
      }
      
    }
  }

  async getExamById(id) {
    try {
      let response = await axiosInstance.get(
        `/exams/${id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
  
      return {
        status: 200,
        data: response.data[0]
      };
    } catch (error) {
      let status = 500;
      let message = 'Ocorreu um erro ao buscar o exame.';

      if(error.name === 'AxiosError') {
        if(error.response) {
          status = error.response.status;
          message = error.response.data.message;
        }
      }

      return {
        status: status,
        message: message
      };  
      
    }
  }

  async createExam(nome, unidade) {
    try {
      let response = await axiosInstance.post(
        `/exams`,
        { nome: nome, unidade: unidade },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      return {
        status: 200,
        examId: response.data[0].id
      };
    } catch (error) {
      let status = 500;
      let message = 'Ocorreu um erro ao salvar o exame.';

      if(error.name === 'AxiosError') {
        if(error.response) {
          status = error.response.status;
          message = error.response.data.message;
        }
      }

      return {
        status: status,
        message: message
      };      
    }
  }

  async updateExam(examId, nome, unidade) {
    try {
      let response = await axiosInstance.put(
        `/exams/${examId}`,
        { nome: nome, unidade: unidade },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      return {
        status: 200,
        examId: response.data[0].id
      };
    } catch (error) {
      let status = 500;
      let message = 'Ocorreu um erro ao salvar o exame.';

      if(error.name === 'AxiosError') {
        if(error.response) {
          status = error.response.status;
          message = error.response.data.message;
        }
      }

      return {
        status: status,
        message: message
      };      
    }
  }

  async deleteExam(examId) {
    try {
      let response = await axiosInstance.delete(`/exams/${examId}`);

      return {
        status: 200,
      };
    } catch (error) {
      let status = 500;
      let message = 'Ocorreu um erro ao salvar o exame.';

      if(error.name === 'AxiosError') {
        if(error.response) {
          status = error.response.status;
          message = error.response.data.message;
        }
      }

      return {
        status: status,
        message: message
      };      
    }
  }
}