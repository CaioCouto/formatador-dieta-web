import { axiosInstance } from "../../utils";

const userRoute = `/users`;

function fireAuthorizedSessionEvent() {
  window.dispatchEvent(new CustomEvent('authorized-session'));
}

export default class User {
  async signin(email, password) {
    try {
      const response = await axiosInstance.post(
        `${userRoute}/signin`, 
        { email, password, },
      );

      localStorage.setItem('user_data', JSON.stringify(response.data));
      fireAuthorizedSessionEvent();

      return {
        status: 200,
        data: response.data
      };
    } catch (error) {
      let statusCode = 500, message = 'Ocorreu um erro ao efetuar login.';
      if(error.name === 'AxiosError') {
        if(error.response) {
          statusCode = error.response.status;
          message = error.response.data.message;
        }
      }
          
      return {
        status: statusCode,
        message: message,
        data: {}
      };
    }
  }

  async signOut() {
    try {
      await axiosInstance.post(`${userRoute}/signout`);
      localStorage.removeItem('user_data');
      
      return {
        status: 200
      };
    } catch (error) {
      let statusCode = 500, message = 'Ocorreu um erro ao efetuar logout.';
      if(error.name === 'AxiosError') {
        if(error.response) {
          statusCode = error.response.status;
          message = error.response.data.message;
        }
      }
      
      return {
        status: statusCode,
        message: message
      };
    }
  }

  async validadeSession() {
    try {
      await axiosInstance.get('');
      fireAuthorizedSessionEvent();
      return {
        status: 200
      };
    } catch (error) {
      let statusCode = 500, message = 'Ocorreu um erro ao validar a sessão.';
      if(error.name === 'AxiosError') {
        if(error.response) {
          statusCode = error.response.status;
          message = error.response.data.message;
        }
      }
      
      return {
        status: statusCode,
        message: message
      };
    }
  }
}