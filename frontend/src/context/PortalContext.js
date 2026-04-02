import { createContext, useContext, useState } from "react";

const PortalContext = createContext({ authed: false, setAuthed: () => {} });

const SESSION_KEY = "ftr_portal_authed";

export const PortalProvider = ({ children }) => {
  const [authed, setAuthedState] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; }
    catch { return false; }
  });

  const setAuthed = (val) => {
    try { val ? sessionStorage.setItem(SESSION_KEY, "1") : sessionStorage.removeItem(SESSION_KEY); }
    catch {}
    setAuthedState(val);
  };

  return (
    <PortalContext.Provider value={{ authed, setAuthed }}>
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => useContext(PortalContext);
export default PortalContext;
