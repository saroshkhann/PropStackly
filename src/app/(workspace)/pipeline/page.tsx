import type { Metadata } from "next";
import { PipelineView } from "@/features/pipeline/components/pipeline-view";
import { getPipelinePageData } from "@/features/pipeline/data/get-pipeline";
import { getWorkspace } from "@/features/workspace/get-workspace";

export const metadata: Metadata = { title: "Pipeline" };

export default async function PipelinePage() {
  const workspace = await getWorkspace();
  const data = await getPipelinePageData(workspace.agency.id);
  return <PipelineView data={data} />;
}
