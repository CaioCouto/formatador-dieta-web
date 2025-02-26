import { atom } from "jotai";
import { returnIconSizeByWindowSize } from "../../utils";

const IconSizeAtom = atom(returnIconSizeByWindowSize());

export default IconSizeAtom;