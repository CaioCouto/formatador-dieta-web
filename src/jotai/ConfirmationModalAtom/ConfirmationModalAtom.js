import { atom } from "jotai";

const ConfirmationModalAtom = atom({
  show: false,
  message: 'Você tem certeza? Essa operação é irreversível.',
});

export default ConfirmationModalAtom;