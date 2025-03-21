"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the schema for the form
const formSchema = z.object({
  subject: z
    .string()
    .min(2, {
      message: "El asunto debe tener al menos 2 caracteres",
    })
    .max(100, {
      message: "El asunto no puede tener más de 100 caracteres",
    }),
});

// Email block interface
interface EmailBlock {
  type: string;
  id: string;
  content: string;
}

const EditEmailContent = ({ campaignData }: { campaignData: any }) => {
  // handle stateful variables
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const router = useRouter();

  // Parse the template content
  const [templateBlocks, setTemplateBlocks] = useState<EmailBlock[]>([]);

  useEffect(() => {
    if (campaignData && campaignData.settings.emailBody) {
      try {
        const parsedContent = JSON.parse(campaignData.settings.emailBody);
        setTemplateBlocks(parsedContent);
      } catch (error) {
        console.error("Error parsing template content:", error);
        setTemplateBlocks([]);
      }
    }
  }, [campaignData]);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: campaignData?.settings?.subject || "",
    },
  });

  // Handle updating block content
  const updateBlockContent = (id: string, newContent: string) => {
    setTemplateBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, content: newContent } : block
      )
    );
  };

  // Handle saving changes
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const updatedContent = JSON.stringify(templateBlocks); // convert to JSON to comply with the database schema
      await axios.post(`/api/campaigns/${campaignData.id}`, {
        ...values,
        emailBody: updatedContent,
      });
      router.refresh();
    } catch (error) {
      console.error("Error saving email content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Editable content component
  const EditableBlock = ({ block }: { block: EmailBlock }) => {
    const [editing, setEditing] = useState(false);
    const [content, setContent] = useState(block.content);

    const handleBlur = () => {
      setEditing(false);
      updateBlockContent(block.id, content);
    };

    const handleClick = () => {
      if (!isPreviewMode) {
        setEditing(true);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleBlur();
      }
    };

    if (editing && !isPreviewMode) {
      return (
        <div
          className={`block-${block.type} border border-primary/50 p-2 rounded`}
          data-block-id={block.id}
        >
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none resize-none"
            rows={Math.max(1, (content.match(/\n/g) || []).length + 1)}
          />
        </div>
      );
    }

    let renderedContent;
    switch (block.type) {
      case "header":
        renderedContent = (
          <h1
            className="text-2xl font-bold mb-4 cursor-text"
            onClick={handleClick}
            data-block-id={block.id}
          >
            {content}
          </h1>
        );
        break;
      case "text":
        renderedContent = (
          <p
            className="mb-4 cursor-text"
            onClick={handleClick}
            data-block-id={block.id}
          >
            {content}
          </p>
        );
        break;
      case "divider":
        renderedContent = (
          <hr
            className="my-4"
            style={{ borderTop: content || "1px solid #EEEEEE" }}
            data-block-id={block.id}
          />
        );
        break;
      case "footer":
        renderedContent = (
          <p
            className="text-sm text-gray-500 mt-4 cursor-text"
            onClick={handleClick}
            data-block-id={block.id}
          >
            {content}
          </p>
        );
        break;
      default:
        renderedContent = null;
    }

    return (
      <div
        className={`block-wrapper ${
          !isPreviewMode
            ? "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors p-1 -m-1 rounded"
            : ""
        }`}
      >
        {renderedContent}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Mail className="h-5 w-5 text-primary" />
          Editar Contenido del Email
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="space-y-3 transition-all duration-200">
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    Asunto del Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Novedades de nuestra empresa"
                      {...field}
                      className="pl-3 pr-10 py-6 text-base transition-all duration-200 border-border/60 focus-visible:border-primary/50 shadow-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <Separator className="my-6" />

            <div className="flex justify-end gap-2 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="gap-2"
              >
                {isPreviewMode ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Salir de Vista Previa
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Vista Previa
                  </>
                )}
              </Button>
            </div>

            <div
              className={`space-y-4 email-content-container ${
                isPreviewMode ? "preview-mode" : "edit-mode"
              }`}
            >
              {templateBlocks.map((block) => (
                <EditableBlock key={block.id} block={block} />
              ))}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 py-4 px-6 bg-gray-50/50 dark:bg-gray-900/50 border-t">
        <Button variant="outline" type="button" className="gap-2">
          Cancelar
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="gap-2 min-w-[140px]"
        >
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EditEmailContent;
