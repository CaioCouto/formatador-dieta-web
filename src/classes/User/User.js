import axios from "axios";

const apiBaseURL = import.meta.env.VITE_LOCALHOST_API_BASE_URL;

export default class User {
  async signin(email, password) {
    try {
      const response = await axios.post(
        `${apiBaseURL}/users/signin`, 
        { email, password, },
        { 
          headers: {
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/json'
          },
          withCredentials: true 
        }
      );

      return {
        status: 200,
        data: response.data
      };
    } catch (error) {
      let statusCode = 500, message = 'Ocorreu um erro ao efetuar login.';
      console.log(error)
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

  static async validateSession() {
    try {
      const response = await axios.get(`${apiBaseURL}/users/validate-session`);
      console.log(response);
    } catch (error) {
      
    }
  }
}