import { axiosInstance } from "../../utils";


const userData = JSON.parse(localStorage.getItem("user_data"));
const access_token = userData ? userData.access_token : null;

export default class Patients {
  async getAll() {
    try {
      let response = await axiosInstance.get(
        `/patients`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
  
      return {
        status: 200,
        data: response.data
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

  async getPatientById(id) {
    try {
      let response = await axiosInstance.get(
        `/patients/${id}`,
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
      let message = 'Ocorreu um erro ao buscar o paciente.';

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

  async createPatient(nome, data_nascimento, sexo) {
    try {
      let response = await axiosInstance.post(
        `/patients`,
        { nome: nome, 
          data_nascimento: data_nascimento, 
          sexo, sexo
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      return {
        status: 200,
        patientId: response.data[0].id
      };
    } catch (error) {
      let status = 500;
      let message = 'Ocorreu um erro ao cadastrar paciente.';

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

  async updatePatient(patientId, nome, data_nascimento, sexo) {
    try {
      await axiosInstance.put(
        `/patients/${patientId}`,
        { nome: nome, 
          data_nascimento: data_nascimento, 
          sexo, sexo
        },
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

  async deletePatient(patientId) {
    try {
      await axiosInstance.delete(`/patients/${patientId}`);

      return {
        status: 200,
      };
    } catch (error) {
      let status = 500;
      let message = 'Ocorreu um erro ao excluir o paciente.';

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