import DeploymentDetails from "@/components/Dashboard/DeployementDetailPage";
import React from "react";

export default async function page({ params }: { params: { id: string } }) {
  const { id } = await params
  return <DeploymentDetails id={id} />;
}
