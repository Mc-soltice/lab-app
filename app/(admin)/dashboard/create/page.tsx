import CreateResourceEditor, {
  type CreateResourceType,
} from "@/components/resource/create/CreateResourceEditor";

const resourceTypes: CreateResourceType[] = ["podcast", "post", "book"];

export default async function CreateResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: rawType } = await searchParams;
  const type = rawType as CreateResourceType | undefined;

  if (!type || !resourceTypes.includes(type)) {
    return <div className="p-6">Type de création introuvable.</div>;
  }

  return <CreateResourceEditor type={type} />;
}
