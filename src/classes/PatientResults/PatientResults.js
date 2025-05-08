import { axiosInstance } from "../../utils";


const userData = JSON.parse(localStorage.getItem("user_data"));
const access_token = userData ? userData.access_token : null;

export default class PatientResults {
  async createPatientResults(result) {
    try {
      await axiosInstance.post(
        `/patients-results`,
        [ result ],
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      return {
        status: 200
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

  async updateExamResults(results) {
    try {
      await axiosInstance.put(
        `/patients-results`,
        results,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      return {
        status: 200
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

  async deleteExamResult(resultId) {
    try {
      await axiosInstance.delete(
        `/patients-results/${resultId}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      return {
        status: 200
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