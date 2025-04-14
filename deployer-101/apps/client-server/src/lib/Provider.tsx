import { ClerkProvider } from "@clerk/nextjs";

import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function Provider({
  children,
}: Props & {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
