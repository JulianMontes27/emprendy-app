"use client";

import type { EmailTemplate } from "@/types/types";
import { useState } from "react";
import {
  AlignLeft,
  ImageIcon,
  BoxIcon as ButtonIcon,
  Minus,
  Variable,
  FootprintsIcon as Footer,
  Heading1,
  Maximize,
  Trash2,
  GripVertical,
  Plus,
  Eye,
  Edit2,
  Save,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface for template elements
interface TemplateElement {
  id: string;
  type: string;
  content: string;
}

// Component for draggable elements that can be added to the template
const DraggableItem = ({
  type,
  label,
  icon,
}: {
  type: string;
  label: string;
  icon: React.ReactNode;
}) => {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("elementType", type);
  };

  return (
    <div
      className="p-3 mb-2 bg-background rounded-md cursor-move border border-border hover:border-primary/50 hover:bg-accent transition-colors flex items-center gap-3 group"
      draggable
      onDragStart={onDragStart}
    >
      <div className="text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </div>
  );
};

// Component for the drop zone where elements can be placed
const DropZone = ({
  elements,
  onDrop,
  onRemoveElement,
  onEditElement,
  onReorderElements,
}: {
  elements: TemplateElement[];
  onDrop: (type: string) => void;
  onRemoveElement: (id: string) => void;
  onEditElement: (id: string, content: string) => void;
  onReorderElements: (startIndex: number, endIndex: number) => void;
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData("elementType");
    if (elementType) {
      onDrop(elementType);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleElementDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("elementIndex", index.toString());
  };

  const handleElementDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleElementDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    const draggedIndex = Number(e.dataTransfer.getData("elementIndex"));
    if (!isNaN(draggedIndex) && draggedIndex !== dropIndex) {
      onReorderElements(draggedIndex, dropIndex);
    }
  };

  const handleElementDragLeave = () => {
    setDragOverIndex(null);
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case "header":
        return <Heading1 size={16} />;
      case "text":
        return <AlignLeft size={16} />;
      case "image":
        return <ImageIcon size={16} />;
      case "button":
        return <ButtonIcon size={16} />;
      case "spacer":
        return <Maximize size={16} />;
      case "divider":
        return <Minus size={16} />;
      case "variable":
        return <Variable size={16} />;
      case "footer":
        return <Footer size={16} />;
      default:
        return <AlignLeft size={16} />;
    }
  };

  return (
    <div
      className="min-h-[400px] p-6 border-2 border-dashed border-border rounded-lg bg-background transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {elements.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="mb-2 flex justify-center">
              <Plus size={24} className="opacity-50" />
            </div>
            <p>Drag and drop elements here to build your template</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {elements.map((element, index) => (
            <div
              key={element.id}
              className={`p-4 border rounded-md relative transition-all ${
                dragOverIndex === index
                  ? "border-primary bg-primary/5"
                  : "border-border"
              } hover:border-primary/50 group`}
              draggable
              onDragStart={(e) => handleElementDragStart(e, index)}
              onDragOver={(e) => handleElementDragOver(e, index)}
              onDrop={(e) => handleElementDrop(e, index)}
              onDragLeave={handleElementDragLeave}
            >
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-move opacity-40 group-hover:opacity-100">
                <GripVertical size={16} />
              </div>
              <div className="flex justify-between items-center pl-6">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {getElementIcon(element.type)}
                  </span>
                  <span className="font-medium text-sm">{element.type}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onRemoveElement(element.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="mt-3">
                {element.type === "button" ? (
                  <Textarea
                    className="w-full min-h-[100px] font-mono text-sm"
                    value={element.content}
                    onChange={(e) => onEditElement(element.id, e.target.value)}
                  />
                ) : (
                  <Input
                    className="w-full"
                    value={element.content}
                    onChange={(e) => onEditElement(element.id, e.target.value)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Variable input component
const VariableInput = ({
  variable,
  onUpdate,
  onRemove,
}: {
  variable: { name: string; description: string };
  onUpdate: (
    oldName: string,
    updatedVariable: { name: string; description: string }
  ) => void;
  onRemove: (name: string) => void;
}) => {
  const [name, setName] = useState(variable.name);
  const [description, setDescription] = useState(variable.description);

  const handleNameChange = (newName: string) => {
    setName(newName);
    onUpdate(variable.name, { name: newName, description });
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    onUpdate(variable.name, { name, description: newDescription });
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <Input
        type="text"
        className="flex-1"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder="Variable name"
      />
      <Input
        type="text"
        className="flex-1"
        value={description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        placeholder="Description"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onRemove(variable.name)}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};

const TemplateEditor = ({ template }: { template: EmailTemplate }) => {
  // Parse template content if it exists
  const initialElements: TemplateElement[] = template.content
    ? JSON.parse(template.content)
    : [];

  const [elements, setElements] = useState<TemplateElement[]>(initialElements);
  const [templateName, setTemplateName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject || "");
  const [category, setCategory] = useState(template.category);
  const [variables, setVariables] = useState<
    Array<{ name: string; description: string }>
  >((template.variables as Array<{ name: string; description: string }>) || []);
  const [activeTab, setActiveTab] = useState("edit");

  const handleDrop = (elementType: string) => {
    const newElement = {
      type: elementType,
      id: `${elementType}_${Date.now()}`,
      content: getDefaultContentForType(elementType),
    };
    setElements([...elements, newElement]);
  };

  const handleRemoveElement = (id: string) => {
    setElements(elements.filter((element) => element.id !== id));
  };

  const handleEditElement = (id: string, content: string) => {
    setElements(
      elements.map((element) =>
        element.id === id ? { ...element, content } : element
      )
    );
  };

  const handleReorderElements = (startIndex: number, endIndex: number) => {
    const result = Array.from(elements);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setElements(result);
  };

  const getDefaultContentForType = (type: string): string => {
    switch (type) {
      case "header":
        return "Welcome to our newsletter!";
      case "text":
        return "Enter your text here...";
      case "image":
        return "https://example.com/image.jpg";
      case "button":
        return `{
  "text": "Click me!",
  "url": "https://example.com",
  "style": "primary"
}`;
      case "spacer":
        return "20"; // Height in pixels
      case "divider":
        return "1px solid #EEEEEE"; // CSS border style
      case "footer":
        return "© 2025 Your Company";
      case "variable":
        return "{{variable_name}}";
      default:
        return "";
    }
  };

  const handleAddVariable = () => {
    const newVariable = {
      name: `variable_${variables.length + 1}`,
      description: `Description for variable ${variables.length + 1}`,
    };
    setVariables([...variables, newVariable]);
  };

  const handleUpdateVariable = (
    oldName: string,
    updatedVariable: { name: string; description: string }
  ) => {
    setVariables(
      variables.map((v) => (v.name === oldName ? updatedVariable : v))
    );

    // Also update references in elements
    if (oldName !== updatedVariable.name) {
      setElements(
        elements.map((element) => ({
          ...element,
          content: element.content.replace(
            new RegExp(`{{${oldName}}}`, "g"),
            `{{${updatedVariable.name}}}`
          ),
        }))
      );
    }
  };

  const handleRemoveVariable = (name: string) => {
    setVariables(variables.filter((v) => v.name !== name));
  };

  const saveTemplate = () => {
    // Convert elements to JSON string for storage
    const contentString = JSON.stringify(elements);

    // Create updated template object based on your schema
    const updatedTemplate: EmailTemplate = {
      ...template,
      name: templateName,
      subject: subject,
      content: contentString,
      variables: variables,
      category: category,
      updatedAt: new Date().toISOString(),
    };

    console.log("Template saved:", updatedTemplate);
    // Here you would typically send this data to your API
  };

  const renderPreview = () => {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">{subject || "No Subject"}</h2>
          <div className="space-y-6">
            {elements.map((element, index) => {
              switch (element.type) {
                case "header":
                  return (
                    <h1 key={index} className="text-2xl font-bold">
                      {element.content}
                    </h1>
                  );
                case "text":
                  return <p key={index}>{element.content}</p>;
                case "image":
                  return (
                    <img
                      key={index}
                      src="/placeholder.svg?height=200&width=400"
                      alt="Preview"
                      className="max-w-full h-auto rounded-md"
                    />
                  );
                case "button":
                  try {
                    const buttonData = JSON.parse(element.content);
                    return (
                      <button
                        key={index}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                      >
                        {buttonData.text}
                      </button>
                    );
                  } catch {
                    return (
                      <button
                        key={index}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                      >
                        Button
                      </button>
                    );
                  }
                case "spacer":
                  return (
                    <div
                      key={index}
                      style={{ height: `${element.content}px` }}
                    ></div>
                  );
                case "divider":
                  return (
                    <hr
                      key={index}
                      style={{ border: element.content }}
                      className="my-4"
                    />
                  );
                case "footer":
                  return (
                    <footer
                      key={index}
                      className="text-sm text-muted-foreground pt-4 border-t"
                    >
                      {element.content}
                    </footer>
                  );
                case "variable":
                  return (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-sm"
                    >
                      {element.content}
                    </span>
                  );
                default:
                  return <div key={index}>{element.content}</div>;
              }
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="templateName"
              className="block mb-2 text-sm font-medium"
            >
              Template Name
            </label>
            <Input
              id="templateName"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block mb-2 text-sm font-medium">
              Subject Line
            </label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block mb-2 text-sm font-medium">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cold_email">Cold Email</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="notification">Notification</SelectItem>
              <SelectItem value="transactional">Transactional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full md:w-64 grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit2 size={16} />
            <span>Edit</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye size={16} />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "preview" ? (
        renderPreview()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar with draggable elements */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Elements
                </h3>
                <div className="space-y-1">
                  <DraggableItem
                    type="header"
                    label="Header"
                    icon={<Heading1 size={18} />}
                  />
                  <DraggableItem
                    type="text"
                    label="Text"
                    icon={<AlignLeft size={18} />}
                  />
                  <DraggableItem
                    type="image"
                    label="Image"
                    icon={<ImageIcon size={18} />}
                  />
                  <DraggableItem
                    type="button"
                    label="Button"
                    icon={<ButtonIcon size={18} />}
                  />
                  <DraggableItem
                    type="spacer"
                    label="Spacer"
                    icon={<Maximize size={18} />}
                  />
                  <DraggableItem
                    type="divider"
                    label="Divider"
                    icon={<Minus size={18} />}
                  />
                  <DraggableItem
                    type="variable"
                    label="Variable"
                    icon={<Variable size={18} />}
                  />
                  <DraggableItem
                    type="footer"
                    label="Footer"
                    icon={<Footer size={18} />}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Variables
                </h3>
                <div className="space-y-3">
                  {variables.map((variable, index) => (
                    <VariableInput
                      key={index}
                      variable={variable}
                      onUpdate={handleUpdateVariable}
                      onRemove={handleRemoveVariable}
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleAddVariable}
                  >
                    <Plus size={16} />
                    <span>Add Variable</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main editor area */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Email Content
              </h3>
              <DropZone
                elements={elements}
                onDrop={handleDrop}
                onRemoveElement={handleRemoveElement}
                onEditElement={handleEditElement}
                onReorderElements={handleReorderElements}
              />
              <div className="flex justify-end">
                <Button
                  className="flex items-center gap-2"
                  onClick={saveTemplate}
                >
                  <Save size={16} />
                  <span>Save Template</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
