import { axiosInstance } from "../../utils";

const access_token = JSON.parse(localStorage.getItem("user_data")).access_token;

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
        if(error.response.status === 404) {
          return {
            status: 404,
            data: []
          };
        }
      }
      
    }
  }
}