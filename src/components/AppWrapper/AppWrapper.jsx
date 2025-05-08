import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAtom } from "jotai";
import { OpenUserAuthenticationModalAtom } from "../../jotai";

export default function AppWrapper({ children }) {
  const { pathname } = useLocation();
  const [_, setOpenUserAuthenticationModal] = useAtom(OpenUserAuthenticationModalAtom);

  useEffect(() => {
    const handler = () => {
      const blockedPaths = ['/login'];

      if (blockedPaths.includes(pathname)) {
        return;
      }

      setOpenUserAuthenticationModal(true);
    };
    
    window.addEventListener("unauthorized-session", handler);

    return () => {
      window.removeEventListener("unauthorized-session", handler);
    };
  }, [pathname]); // importante: escuta mudanças de rota
  

  return children;
}
