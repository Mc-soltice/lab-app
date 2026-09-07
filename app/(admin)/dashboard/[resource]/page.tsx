import ResourcePage from "@/components/resource/ResourcePage";

export default async function DynamicResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <ResourcePage resource={resource} />;
}
