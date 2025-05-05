export default function showAlertComponent(message, type, show, setAlertFn) {
  setAlertFn({ message, type, show });

  setTimeout(() => {
    setAlertFn({ message: '', type: 'success', show: false });
  }, 5000);
}