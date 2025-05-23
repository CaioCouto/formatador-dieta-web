import styles from './styles.module.css';
import { useEffect, useState } from 'react';

function returnGenderProperName(gender) {
  if (gender === 'm') {
    return 'masculino';
  }
  else if (gender === 'f') {
    return 'feminino';
  }
  
  return 'todos';
}

export default function RefereceTable({ results, unit, tableClassName, tableRowClassName, tableDataClassName }) {
  const [ genders, setGenders ] = useState([]);
  const [ resultsByGender, setResultsByGender ] = useState([]);
  const [ genderStartIndex, setGenderStartIndex ] = useState({});
  const [ genderCounter, setGenderCounter ] = useState({});
  
  function generateFormatedResults() {
    const resultados_grouped_by_gender = {};
    const varGenderStartIndex = {};
    const varGenderCounter = {};

    results.forEach(resultado => {
      varGenderStartIndex[resultado.sexo] = 0;
      varGenderCounter[resultado.sexo] = 0;
      resultados_grouped_by_gender[resultado.sexo];
      
      if(resultados_grouped_by_gender[resultado.sexo]) { 
        resultados_grouped_by_gender[resultado.sexo].push(resultado); 
      }
      else { 
        resultados_grouped_by_gender[resultado.sexo] = [resultado]; 
      }
    });

    Object.values(resultados_grouped_by_gender).forEach((results) => {
      results.forEach((result, index) => {
        varGenderStartIndex[result.sexo] = index;
        varGenderCounter[result.sexo]++;
        varGenderStartIndex[result.sexo] = varGenderStartIndex[result.sexo] - varGenderCounter[result.sexo] + 1;
      });
    });

    setGenders(Object.keys(resultados_grouped_by_gender));
    setResultsByGender(resultados_grouped_by_gender);
    setGenderStartIndex(varGenderStartIndex);
    setGenderCounter(varGenderCounter);
  }

  useEffect(() => {
    generateFormatedResults();
  }, [results]);

  return (
    <table className={ `${styles["table"]} ${tableClassName || styles["default__table"]}` }>
      <thead>
        <tr>
          <th>Sexo</th>
          <th>Valor</th>
          <th>Classificação</th>
        </tr>
      </thead>
      <tbody>
        {
          Object.keys(resultsByGender).map((gender) => (
            resultsByGender[gender].map((result, index) => (
              <tr key={ index } className={ `${tableRowClassName || styles["default__table-row"]}` }>
                {
                  index === genderStartIndex[result.sexo] ?
                  <td 
                    rowSpan={ genderCounter[result.sexo]} 
                    className={ `${styles["table-data-gender"]}  ${ tableDataClassName || styles["default__table-data"] }` }
                  >{ returnGenderProperName(genders[genders.indexOf(result.sexo)]) }</td>
                  : null
                }
                <td className={ `${styles["table-data-value"]}  ${ tableDataClassName || styles["default__table-data"] }` }>
                  { result.valor } { unit }
                </td>
                <td className={ `${styles["table-data-result"]}  ${ tableDataClassName || styles["default__table-data"] }` }>{ result.resultado }</td>
              </tr>
            ))
          ))
        }
      </tbody>
    </table>
  );
}