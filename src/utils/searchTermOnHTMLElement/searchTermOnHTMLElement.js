export default function searchTermOnHTMLElement(term, el, targetClass) {
  let re = new RegExp(String.raw`^${term.toLowerCase()}`);
  const examName = el.querySelector(`.${targetClass}`).innerText;
  return examName.toLowerCase().search(re) !== -1;
}