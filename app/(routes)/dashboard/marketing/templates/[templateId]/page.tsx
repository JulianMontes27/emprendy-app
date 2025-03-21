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
    <div className="container mx-auto p-6">
      {/* Modern Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Editando: <span className="text-blue-600">{template.name}</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Personalice su plantilla de correo electrónico para que coincida con
          su marca y mensaje.{" "}
        </p>
      </div>

      {/* Template Editor */}
      <TemplateEditor template={template} />
    </div>
  );
};

export default TemplateIdPage;
