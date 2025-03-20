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
  LayoutGrid,
  MoveHorizontal,
  ChevronDown,
  ChevronUp,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Interface for template elements
interface TemplateElement {
  id: string;
  type: string;
  content: string;
  children?: TemplateElement[];
  columns?: number;
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

const DropZone = ({
  elements,
  onDrop,
  onRemoveElement,
  onEditElement,
  onReorderElements,
  onAddToSection,
  parentId = null,
  level = 0,
  onUpdateColumns,
}: {
  elements: TemplateElement[];
  onDrop: (type: string, parentId?: string | null) => void;
  onRemoveElement: (id: string) => void;
  onEditElement: (id: string, content: string) => void;
  onReorderElements: (
    startIndex: number,
    endIndex: number,
    parentId?: string | null
  ) => void;
  onAddToSection?: (elementId: string, targetSectionId: string) => void;
  parentId?: string | null;
  level?: number;
  onUpdateColumns?: (id: string, columns: number) => void;
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isSectionExpanded = (id: string) => {
    return expandedSections[id] !== false; // Default to expanded
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    const elementType = e.dataTransfer.getData("elementType");
    const elementId = e.dataTransfer.getData("elementId");

    if (elementType) {
      onDrop(elementType, parentId);
    } else if (elementId && parentId && onAddToSection) {
      onAddToSection(elementId, parentId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleElementDragStart = (
    e: React.DragEvent,
    element: TemplateElement,
    index: number
  ) => {
    e.dataTransfer.setData("elementIndex", index.toString());
    e.dataTransfer.setData("elementId", element.id);
    e.dataTransfer.setData("parentId", parentId || "root");
  };

  const handleElementDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleElementDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    setDragOverIndex(null);

    const draggedIndex = Number(e.dataTransfer.getData("elementIndex"));
    const sourceParentId = e.dataTransfer.getData("parentId");

    // Only reorder if from the same parent
    if (
      !isNaN(draggedIndex) &&
      draggedIndex !== dropIndex &&
      sourceParentId === (parentId || "root")
    ) {
      onReorderElements(draggedIndex, dropIndex, parentId);
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
      case "section":
        return <LayoutGrid size={16} />;
      case "columns":
        return <MoveHorizontal size={16} />;
      default:
        return <AlignLeft size={16} />;
    }
  };

  return (
    <div
      className={`min-h-[100px] p-4 border-2 border-dashed ${
        level === 0 ? "border-border" : "border-border/70"
      } rounded-lg bg-background/80 transition-colors`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ marginLeft: level > 0 ? `${level * 8}px` : "0" }}
    >
      {elements.length === 0 ? (
        <div className="h-full flex items-center justify-center py-6">
          <div className="text-center text-muted-foreground">
            <div className="mb-2 flex justify-center">
              <Plus size={24} className="opacity-50" />
            </div>
            <p className="text-sm">Drop elements here</p>
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
                  : element.type === "section" || element.type === "columns"
                  ? "border-primary/20 bg-background"
                  : "border-border"
              } hover:border-primary/50 group`}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element, index)}
              onDragOver={(e) => handleElementDragOver(e, index)}
              onDrop={(e) => handleElementDrop(e, index)}
              onDragLeave={handleElementDragLeave}
            >
              <div className="absolute left-2 top-4 text-muted-foreground cursor-move opacity-40 group-hover:opacity-100">
                <GripVertical size={16} />
              </div>

              {element.type === "section" || element.type === "columns" ? (
                <Collapsible
                  open={isSectionExpanded(element.id)}
                  onOpenChange={() => toggleSection(element.id)}
                >
                  <div className="flex justify-between items-center pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">
                        {getElementIcon(element.type)}
                      </span>
                      <span className="font-medium">
                        {element.type === "section"
                          ? "Section"
                          : `${element.columns || 2}-Column Layout`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {element.type === "columns" && (
                        <Select
                          value={element.columns?.toString() || "2"}
                          onValueChange={(value) =>
                            onUpdateColumns?.(
                              element.id,
                              Number.parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue placeholder="Columns" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Columns</SelectItem>
                            <SelectItem value="3">3 Columns</SelectItem>
                            <SelectItem value="4">4 Columns</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isSectionExpanded(element.id) ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onRemoveElement(element.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent className="mt-3">
                    {element.type === "columns" ? (
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: `repeat(${
                            element.columns || 2
                          }, 1fr)`,
                          gap: "12px",
                        }}
                      >
                        {Array.from({ length: element.columns || 2 }).map(
                          (_, colIndex) => (
                            <DropZone
                              key={`${element.id}-col-${colIndex}`}
                              elements={
                                element.children?.filter(
                                  (_, i) =>
                                    Math.floor(i / (element.columns || 2)) ===
                                    colIndex
                                ) || []
                              }
                              onDrop={(type) =>
                                onDrop(type, element.id + `-col-${colIndex}`)
                              }
                              onRemoveElement={onRemoveElement}
                              onEditElement={onEditElement}
                              onReorderElements={(start, end) =>
                                onReorderElements(
                                  start,
                                  end,
                                  element.id + `-col-${colIndex}`
                                )
                              }
                              onAddToSection={onAddToSection}
                              parentId={element.id + `-col-${colIndex}`}
                              level={level + 1}
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <DropZone
                        elements={element.children || []}
                        onDrop={(type) => onDrop(type, element.id)}
                        onRemoveElement={onRemoveElement}
                        onEditElement={onEditElement}
                        onReorderElements={(start, end) =>
                          onReorderElements(start, end, element.id)
                        }
                        onAddToSection={onAddToSection}
                        parentId={element.id}
                        level={level + 1}
                      />
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <>
                  <div className="flex justify-between items-center pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {getElementIcon(element.type)}
                      </span>
                      <span className="font-medium text-sm">
                        {element.type}
                      </span>
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
                        onChange={(e) =>
                          onEditElement(element.id, e.target.value)
                        }
                      />
                    ) : (
                      <Input
                        className="w-full"
                        value={element.content}
                        onChange={(e) =>
                          onEditElement(element.id, e.target.value)
                        }
                      />
                    )}
                  </div>
                </>
              )}
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

// Helper function to find an element by ID in a nested structure
const findElementById = (
  elements: TemplateElement[],
  id: string
): {
  element: TemplateElement | null;
  parent: TemplateElement[] | null;
  parentId: string | null;
} => {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].id === id) {
      return { element: elements[i], parent: elements, parentId: null };
    }

    if (elements[i].children) {
      // Check if it's a columns element with special column IDs
      if (elements[i].type === "columns") {
        const columns = elements[i].columns || 2;
        for (let col = 0; col < columns; col++) {
          const colId = `${elements[i].id}-col-${col}`;
          const colElements = elements[i].children.filter(
            (_, idx) => idx % columns === col
          );

          for (let j = 0; j < colElements.length; j++) {
            if (colElements[j].id === id) {
              return {
                element: colElements[j],
                parent: elements[i].children.filter(
                  (_, idx) => idx % columns === col
                ),
                parentId: colId,
              };
            }

            if (colElements[j].children) {
              const result = findElementById(colElements[j].children, id);
              if (result.element) {
                return result;
              }
            }
          }
        }
      } else {
        const result = findElementById(elements[i].children, id);
        if (result.element) {
          return { ...result, parentId: result.parentId || elements[i].id };
        }
      }
    }
  }

  return { element: null, parent: null, parentId: null };
};

// Helper function to get elements from a specific column in a columns element
// Fixed function for column handling
const getColumnElements = (
  element: TemplateElement,
  colIndex: number
): TemplateElement[] => {
  if (!element.children) return [];
  const columns = element.columns || 2;
  return element.children.filter(
    (_, idx) => Math.floor(idx / columns) === colIndex
  );
};
///////////////////////////////

const TemplateEditor = ({ template }: { template: EmailTemplate }) => {
  // Parse template content if it exists, if not, initialize the state to an empty []
  const initialElements: TemplateElement[] = template.content
    ? JSON.parse(template.content)
    : [];
  const [elements, setElements] = useState<TemplateElement[]>(initialElements);

  // track the state of the template members
  const [templateName, setTemplateName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject || "");
  const [category, setCategory] = useState(template.category || "");
  const [variables, setVariables] = useState<
    Array<{ name: string; description: string }>
  >((template.variables as Array<{ name: string; description: string }>) || []);

  // Track the opened tab
  const [activeTab, setActiveTab] = useState("edit");

  const router = useRouter();

  const handleDrop = (elementType: string, parentId: string | null = null) => {
    // Create new element
    const newElement: TemplateElement = {
      type: elementType,
      id: `${elementType}_${Date.now()}`, // Unique ID
      content: getDefaultContentForType(elementType),
    };

    if (elementType === "section" || elementType === "columns") {
      newElement.children = [];
      if (elementType === "columns") {
        newElement.columns = 2;
      }
    }

    // If no parentId, add to root elements
    if (!parentId) {
      setElements((prev) => [...prev, newElement]);
      return;
    }

    // Handle nested elements (sections or columns)
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      const { element: parentElement } = findElementById(
        updatedElements,
        parentId
      );

      if (!parentElement) return updatedElements;

      // Handle columns separately
      if (parentElement.type === "columns") {
        const columns = parentElement.columns || 2;

        // Find the column index if parentId includes "-col-"
        if (parentId.includes("-col-")) {
          const [sectionId, colPart] = parentId.split("-col-");
          const colIndex = Number.parseInt(colPart);

          // Ensure parentElement.children exists
          if (!parentElement.children) {
            parentElement.children = [];
          }

          // Calculate the insert position for this column
          const colElements = parentElement.children.filter(
            (_, idx) => Math.floor(idx / columns) === colIndex
          );

          // Find the correct insertion index for the column
          let insertIndex = colIndex;
          if (parentElement.children.length > 0) {
            // Find the last element in this column
            const lastColElementIndex = parentElement.children
              .map((_, i) => i)
              .filter((i) => Math.floor(i / columns) === colIndex)
              .pop();

            insertIndex =
              lastColElementIndex !== undefined
                ? lastColElementIndex + 1
                : colIndex;
          }

          // Insert the new element at the correct position
          parentElement.children.splice(insertIndex, 0, newElement);
        }
      } else if (parentElement.type === "section") {
        // Handle regular sections
        if (!parentElement.children) {
          parentElement.children = [];
        }
        // Ensure the element isn't already in the children array
        if (
          !parentElement.children.some((child) => child.id === newElement.id)
        ) {
          parentElement.children.push(newElement);
        }
      }

      return updatedElements;
    });
  };

  const handleEditElement = (id: string, content: string) => {
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      const { element } = findElementById(updatedElements, id);

      if (element) {
        element.content = content;
      }

      return updatedElements;
    });
  };

  const handleUpdateColumns = (id: string, columns: number) => {
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      const { element } = findElementById(updatedElements, id);

      if (element && element.type === "columns") {
        element.columns = columns;
      }

      return updatedElements;
    });
  };

  const handleReorderElements = (
    startIndex: number,
    endIndex: number,
    parentId: string | null = null
  ) => {
    if (!parentId) {
      // Reordering top-level elements
      const result = Array.from(elements);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      setElements(result);
      return;
    }

    // Handle columns separately
    if (parentId.includes("-col-")) {
      const [sectionId, colPart] = parentId.split("-col-");
      const colIndex = Number.parseInt(colPart);

      setElements((prevElements) => {
        const updatedElements = [...prevElements];
        const { element: section } = findElementById(
          updatedElements,
          sectionId
        );

        if (section && section.type === "columns" && section.children) {
          const columns = section.columns || 2;
          const colElements = section.children.filter(
            (_, idx) => idx % columns === colIndex
          );

          // Remove the element from its original position
          const [removed] = colElements.splice(startIndex, 1);

          // Insert at the new position
          colElements.splice(endIndex, 0, removed);

          // Reconstruct the children array with the updated column
          const newChildren: TemplateElement[] = [];
          for (
            let i = 0;
            i < Math.max(columns, Math.ceil(section.children.length / columns));
            i++
          ) {
            for (let col = 0; col < columns; col++) {
              const colItems = section.children.filter(
                (_, idx) => idx % columns === col
              );
              if (i < colItems.length) {
                newChildren.push(colItems[i]);
              }
            }
          }

          section.children = newChildren;
        }

        return updatedElements;
      });
      return;
    }

    // Reordering elements within a section
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      const { element: section } = findElementById(updatedElements, parentId);

      if (section && section.children) {
        const result = Array.from(section.children);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        section.children = result;
      }

      return updatedElements;
    });
  };

  const handleAddToSection = (elementId: string, targetSectionId: string) => {
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      const { element, parent } = findElementById(updatedElements, elementId);

      if (!element || !parent) return updatedElements;

      // Remove the element from its current location
      const index = parent.indexOf(element);
      if (index !== -1) {
        parent.splice(index, 1);
      }

      // Add it to the target section
      if (targetSectionId.includes("-col-")) {
        const [sectionId, colPart] = targetSectionId.split("-col-");
        const colIndex = Number.parseInt(colPart);

        const { element: section } = findElementById(
          updatedElements,
          sectionId
        );

        if (section && section.type === "columns") {
          if (!section.children) {
            section.children = [];
          }

          const columns = section.columns || 2;

          // Get all existing elements in this column
          const colElements = section.children.filter(
            (_, idx) => Math.floor(idx / columns) === colIndex
          );

          // Calculate insertion index - should be after the last element in this column
          let insertIndex = colIndex;
          if (colElements.length > 0) {
            // Find indices of all elements in this column
            const colIndices = section.children
              .map((_, i) => i)
              .filter((i) => Math.floor(i / columns) === colIndex);

            // Get the last index and add 1
            insertIndex = colIndices[colIndices.length - 1] + 1;
          }

          // Insert the element at the correct position
          section.children.splice(insertIndex, 0, element);
        }
      } else {
        const { element: targetSection } = findElementById(
          updatedElements,
          targetSectionId
        );
        if (targetSection) {
          if (!targetSection.children) {
            targetSection.children = [];
          }
          targetSection.children.push(element);
        }
      }

      return updatedElements;
    });
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
      case "section":
      case "columns":
        return ""; // Sections don't have content
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
      const updateContent = (elements: TemplateElement[]) => {
        return elements.map((element) => {
          const updatedElement = { ...element };

          if (element.content) {
            updatedElement.content = element.content.replace(
              new RegExp(`{{${oldName}}}`, "g"),
              `{{${updatedVariable.name}}}`
            );
          }

          if (element.children) {
            updatedElement.children = updateContent(element.children);
          }

          return updatedElement;
        });
      };

      setElements(updateContent(elements));
    }
  };

  const handleRemoveVariable = (name: string) => {
    setVariables(variables.filter((v) => v.name !== name));
  };

  const saveTemplate = async () => {
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
      updatedAt: new Date(),
    };

    try {
      const response = await fetch(
        `/api/campaigns/templates/${updatedTemplate.id}/save-template`,
        {
          method: "POST", // Use POST or PUT depending on your API
          headers: {
            "Content-Type": "application/json", // Ensure the correct Content-Type header
          },
          body: JSON.stringify(updatedTemplate), // Send the updated template as JSON
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      const parsedJSONdata = await response.json();
      router.refresh();
      toast.success("Tu plantilla se guardó correctamente.");

      // Optionally, show a success message to the user
    } catch (error) {
      console.log(error);
      toast.error("Ocurrió un error. Intenta de nuevo mas tarde.");
    }
  };

  // Recursive function to render preview of nested elements
  const renderElementPreview = (element: TemplateElement, index: number) => {
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
          <div key={index} style={{ height: `${element.content}px` }}></div>
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
      case "section":
        return (
          <div
            key={index}
            className="border border-border/30 rounded-md p-4 my-4"
          >
            {element.children?.map((child, childIndex) =>
              renderElementPreview(child, childIndex)
            )}
          </div>
        );
      case "columns":
        return (
          <div key={index} className="my-4">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${element.columns || 2}, 1fr)`,
                gap: "16px",
              }}
            >
              {Array.from({ length: element.columns || 2 }).map(
                (_, colIndex) => {
                  // Get elements for this specific column
                  const colElements = getColumnElements(element, colIndex);

                  return (
                    <div key={colIndex} className="space-y-4">
                      {colElements.map((child, childIndex) =>
                        renderElementPreview(child, childIndex)
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        );
      default:
        return <div key={index}>{element.content}</div>;
    }
  };
  const renderPreview = () => {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">{subject || "No Subject"}</h2>
          <div className="space-y-6">
            {elements.map((element, index) =>
              renderElementPreview(element, index)
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleRemoveElement = (id: string) => {
    // First check if it's a top-level element
    if (elements.some((el) => el.id === id)) {
      setElements(elements.filter((element) => element.id !== id));
      return;
    }

    // Otherwise, search through the nested structure
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      const { element, parent } = findElementById(updatedElements, id);

      if (element && parent) {
        const index = parent.indexOf(element);
        if (index !== -1) {
          parent.splice(index, 1);
        }
      }

      return updatedElements;
    });
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
                  Layouts
                </h3>
                <div className="space-y-1">
                  <DraggableItem
                    type="section"
                    label="Section"
                    icon={<LayoutGrid size={18} />}
                  />
                  {/* <DraggableItem
                    type="columns"
                    label="Columns"
                    icon={<MoveHorizontal size={18} />}
                  /> */}
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
                onAddToSection={handleAddToSection}
                onUpdateColumns={handleUpdateColumns}
              />
              <div className="flex justify-end">
                <Button
                  className="flex items-center gap-2"
                  onClick={saveTemplate}
                >
                  <Save size={16} />
                  <span>Guardar Plantilla</span>
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
