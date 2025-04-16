import DeployProject from "@/components/Dashboard/DeployProject";
import React from "react";

export default async function page({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = await params;
  return <DeployProject projectId={projectId} />;
}
