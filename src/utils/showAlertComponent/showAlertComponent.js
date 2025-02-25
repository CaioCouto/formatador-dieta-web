export default function showAlertComponent(message, type, show, setAlertFn) {
  setAlertFn({ message, type, show });
}