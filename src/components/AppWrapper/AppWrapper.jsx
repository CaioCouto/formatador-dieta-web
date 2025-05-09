import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAtom } from "jotai";
import { OpenUserAuthenticationModalAtom } from "../../jotai";
import { blockedPaths } from "../../utils";

export default function AppWrapper({ children }) {
  const { pathname } = useLocation();
  const [_, setOpenUserAuthenticationModal] = useAtom(OpenUserAuthenticationModalAtom);

  useEffect(() => {
    const unauthorizedSessionHandler = () => {
      if (blockedPaths.includes(pathname)) {return; }

      setOpenUserAuthenticationModal(true);
    };
    const authorizedSessionHandler = () => {
      setOpenUserAuthenticationModal(false);
    };
    
    window.addEventListener("unauthorized-session", unauthorizedSessionHandler);
    window.addEventListener("authorized-session", authorizedSessionHandler);

    return () => {
      window.removeEventListener("unauthorized-session", unauthorizedSessionHandler);
      window.removeEventListener("authorized-session", authorizedSessionHandler);
    };
  }, [pathname]); // importante: escuta mudanças de rota
  

  return children;
}
