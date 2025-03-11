import { db } from "@/db";
import { emailTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import TemplateEditor from "../_components/editor";

const TemplateIdPage = async ({
  params,
}: {
  params: {
    templateId: string;
  };
}) => {
  if (!params.templateId) {
    return null;
  }

  const [template] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.id, params.templateId));

  return (
    <div>
      <h1>Edit Template: {template.name}</h1>
      <TemplateEditor template={template} />
    </div>
  );
};

export default TemplateIdPage;
