import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      return;
    }

    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
  }, [hash, pathname]);

  return null;
};
