import { useEffect, useState, type PropsWithChildren } from "react";
import { authApi } from "./auth.api";
import { useAuthStore } from "@/store";

export const AuthBootstrap = ({ children }: PropsWithChildren) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      if (!accessToken) {
        if (isMounted) setHasBootstrapped(true);
        return;
      }

      try {
        const currentUser = await authApi.me();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        clearAuth();
      } finally {
        if (isMounted) {
          setHasBootstrapped(true);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [accessToken, clearAuth, setUser]);

  if (!hasBootstrapped) {
    return (
      <div className="grid min-h-screen place-items-center bg-white text-sm font-semibold text-[#444748]">
        Loading SmartShift...
      </div>
    );
  }

  return children;
};
