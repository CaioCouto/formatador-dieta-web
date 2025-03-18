export default function returnExamResultsIntervals(results, index) {

  if (index === 0) { 
    return `< ${ results[index].valor }` 
  }
  else if (index === results.length - 1) { 
    return `≥ ${ results[index].valor }` 
  }
  else {
    return `${ results[index - 1].valor } - ${ results[index].valor }`
  }
}