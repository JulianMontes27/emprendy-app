import React from "react";

interface TemplatePageProps {
  params: {
    templateId: string;
  };
}
const TemplatePage: React.FC<TemplatePageProps> = ({
  params: { templateId },
}) => {
  return <div>{templateId}</div>;
};

export default TemplatePage;
