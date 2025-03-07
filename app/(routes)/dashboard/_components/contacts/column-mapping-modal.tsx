"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, RefreshCw, CheckCircle2, XCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the contact schema fields
const CONTACT_SCHEMA_FIELDS = [
  { key: "firstName", label: "Primer Nombre" },
  { key: "lastName", label: "Apellido" },
  { key: "email", label: "Email *", required: true },
  { key: "companyName", label: "Empresa" },
  { key: "jobTitle", label: "Título de Trabajo" },
  { key: "phone", label: "Número de teléfono" },
  { key: "linkedinUrl", label: "URL de LinkedIn" },
  { key: "website", label: "Página web" },
  { key: "industry", label: "Industria" },
  { key: "companySize", label: "Tamaño de empresa" },
  { key: "location", label: "Ubicación" },
  { key: "notes", label: "Notas" },
  { key: "tags", label: "Etiquetas" },
];

interface ColumnMappingProps {
  excelColumns: string[];
  onMappingComplete: (mapping: Record<string, string>) => void;
  rawData: any[];
}

export function ColumnMappingModal({
  excelColumns,
  onMappingComplete,
  rawData,
}: ColumnMappingProps) {
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendedMappings, setRecommendedMappings] = useState<
    Record<string, string>
  >({});

  const router = useRouter();

  // Generate recommendations based on column names
  useEffect(() => {
    const recommendations: Record<string, string> = {};

    // Define common patterns for each field
    const patterns = {
      firstName: [
        "primer_nombre",
        "name",
        "first_name",
        "fname",
        "name",
        "nombre",
        "primer nombre",
      ],
      lastName: [
        "last name",
        "last_name",
        "lastname",
        "lname",
        "surname",
        "apellido",
        "segundo nombre",
      ],
      email: ["email", "e-mail", "correo", "correo electrónico", "mail"],
      companyName: [
        "company",
        "company name",
        "company_name",
        "companyname",
        "organization",
        "empresa",
        "compañía",
      ],
      jobTitle: [
        "job",
        "title",
        "job title",
        "job_title",
        "jobtitle",
        "role",
        "position",
        "puesto",
        "cargo",
      ],
      phone: [
        "phone",
        "phone number",
        "phone_number",
        "phonenumber",
        "telephone",
        "mobile",
        "teléfono",
        "celular",
      ],
      linkedinUrl: ["linkedin", "linkedin url", "linkedin_url", "profile"],
      website: ["website", "site", "web", "url", "sitio web"],
      industry: ["industry", "sector", "industria"],
      companySize: [
        "company size",
        "company_size",
        "companysize",
        "size",
        "employees",
        "tamaño",
      ],
      location: [
        "location",
        "address",
        "city",
        "country",
        "state",
        "dirección",
        "ubicación",
      ],
      notes: ["notes", "comments", "description", "notas", "comentarios"],
      tags: ["tags", "categories", "labels", "etiquetas"],
    };

    // Find best matches for each field
    CONTACT_SCHEMA_FIELDS.forEach((field) => {
      const fieldPatterns = patterns[field.key as keyof typeof patterns] || [];

      // Find the best matching column
      for (const column of excelColumns) {
        const lowerColumn = column.toLowerCase();

        // Check for exact matches first
        if (fieldPatterns.some((pattern) => lowerColumn === pattern)) {
          recommendations[field.key] = column;
          break;
        }

        // Then check for columns that contain the pattern
        for (const pattern of fieldPatterns) {
          if (lowerColumn.includes(pattern)) {
            recommendations[field.key] = column;
            break;
          }
        }

        // If we found a match, stop looking for this field
        if (recommendations[field.key]) break;
      }
    });

    setRecommendedMappings(recommendations);
  }, [excelColumns]);

  // Update mapping for a specific field
  const updateMapping = (schemaField: string, excelColumn: string | null) => {
    setColumnMapping((prev: any) => ({
      ...prev,
      [schemaField]: excelColumn,
    }));
  };

  // Apply all recommendations
  const applyRecommendations = () => {
    setColumnMapping(recommendedMappings);
  };

  // Generate preview based on current mapping
  useEffect(() => {
    if (rawData.length > 0) {
      const preview = rawData.slice(0, 5).map((row) => {
        const previewRow: Record<string, any> = {};

        CONTACT_SCHEMA_FIELDS.forEach((field) => {
          const mappedColumn = columnMapping[field.key];
          previewRow[field.key] = mappedColumn
            ? row[mappedColumn]
            : "Not Mapped";
        });

        return previewRow;
      });

      setPreviewData(preview);
    }
  }, [columnMapping, rawData]);

  // Validate mapping (at least email is mapped)
  const isValidMapping = () => {
    return columnMapping["email"] !== undefined;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (isValidMapping()) {
      onMappingComplete(columnMapping);
      router.refresh();
    } else {
      alert("La columna de Email debe estar asignada.");
    }
  };

  // Clear all mappings
  const clearMappings = () => {
    setColumnMapping({});
  };

  // Filter columns based on search query
  const filteredColumns = excelColumns.filter((column) =>
    column.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count how many recommendations are available
  const recommendationsCount = Object.keys(recommendedMappings).length;

  return (
    <div
      id="mapping_section"
      className="mt-8 p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Asigna columnas de Excel a campos de contacto
      </h2>

      {/* Recommendations Banner */}
      {recommendationsCount > 0 && (
        <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-blue-800">
              {recommendationsCount} columnas
              {recommendationsCount !== 1 ? "s" : ""} pueden ser automáticamente
              mappeadas (asignadas a una columna)
            </span>
          </div>
          <Button
            onClick={applyRecommendations}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Aplicar recomendaciones{" "}
          </Button>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          placeholder="Search columns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Column Mapping Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {CONTACT_SCHEMA_FIELDS.map((field) => {
          const hasRecommendation =
            recommendedMappings[field.key] && !columnMapping[field.key];

          return (
            <div
              key={field.key}
              className={`flex items-center space-x-4 p-2 rounded-lg transition-colors ${
                hasRecommendation
                  ? "bg-blue-50 border border-blue-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <label
                className={`w-32 ${
                  field.required ? "font-bold text-red-600" : "text-gray-700"
                }`}
              >
                {field.label}
                {field.required && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="inline-block ml-2 h-4 w-4 text-gray-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Este campo es requerido.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </label>
              <div className="flex-grow">
                <Select
                  value={columnMapping[field.key] || ""}
                  onValueChange={(value) =>
                    updateMapping(
                      field.key,
                      value === "unmapped" ? null : value
                    )
                  }
                >
                  <SelectTrigger
                    className={`w-full rounded-xl ${
                      hasRecommendation
                        ? "border-blue-300 ring-1 ring-blue-300"
                        : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        hasRecommendation
                          ? `Recommended: ${recommendedMappings[field.key]}`
                          : "Select Column"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unmapped">Unmapped</SelectItem>
                    {filteredColumns.map((column) => (
                      <SelectItem
                        key={column}
                        value={column}
                        className={
                          recommendedMappings[field.key] === column
                            ? "bg-blue-50 font-medium"
                            : ""
                        }
                      >
                        {column}
                        {recommendedMappings[field.key] === column && (
                          <span className="ml-2 text-blue-600">
                            (Recomendado)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasRecommendation && (
                  <div className="mt-1 flex">
                    <Zap className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-600">
                      Asignación recomendada
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Data Preview
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                {CONTACT_SCHEMA_FIELDS.map((field) => (
                  <th
                    key={field.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  {CONTACT_SCHEMA_FIELDS.map((field) => {
                    const value = row[field.key];
                    const isMapped = value !== "Not Mapped";

                    return (
                      <td
                        key={field.key}
                        className={`px-4 py-3 text-sm ${
                          !isMapped ? "text-gray-400 italic" : "text-gray-700"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {isMapped ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 mr-2" />
                          )}
                          {value || "N/A"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={clearMappings}
            className="hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpiar asginaciones
          </Button>
          {recommendationsCount > 0 && (
            <Button
              variant="outline"
              onClick={applyRecommendations}
              className="hover:bg-blue-50 text-blue-600 border-blue-200 transition-colors"
            >
              <Zap className="mr-2 h-4 w-4" />
              Aplicar Recomendaciones
            </Button>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!isValidMapping()}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
