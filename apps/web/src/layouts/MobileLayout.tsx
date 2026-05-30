import type { PropsWithChildren } from "react";

export const MobileLayout = ({ children }: PropsWithChildren) => {
  return <div className="mx-auto min-h-screen w-full max-w-md bg-white">{children}</div>;
};
