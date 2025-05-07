import axiosInstance from "./axiosInstance";
import { processQueue, addToQueue, setRefreshing, getRefreshing } from "./axiosSessionQueue";
import returnExamResultsIntervals from "./returnExamResultsIntervals";
import returnIconSizeByWindowSize from "./returnIconSizeByWindowSize";
import searchTermOnHTMLElement from "./searchTermOnHTMLElement";
import showAlertComponent from "./showAlertComponent";

export {
  addToQueue,
  axiosInstance,
  getRefreshing,
  showAlertComponent,
  processQueue,
  returnExamResultsIntervals,
  searchTermOnHTMLElement,
  setRefreshing,
  returnIconSizeByWindowSize
};