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
import { Info, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the contact schema fields (unchanged)
const CONTACT_SCHEMA_FIELDS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email *", required: true },
  { key: "companyName", label: "Company Name" },
  { key: "jobTitle", label: "Job Title" },
  { key: "phone", label: "Phone Number" },
  { key: "linkedinUrl", label: "LinkedIn URL" },
  { key: "website", label: "Website" },
  { key: "industry", label: "Industry" },
  { key: "companySize", label: "Company Size" },
  { key: "location", label: "Location" },
  { key: "notes", label: "Notes" },
  { key: "tags", label: "Tags" },
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

  const router = useRouter();

  // Previous useEffect hooks remain the same

  // Update mapping for a specific field
  const updateMapping = (schemaField: string, excelColumn: string | null) => {
    setColumnMapping((prev) => ({
      ...prev,
      [schemaField]: excelColumn,
    }));
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
      alert("Email column must be mapped");
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

  return (
    <div className="mt-8 p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Asigna columnas de Excel a campos de contacto
      </h2>

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
        {CONTACT_SCHEMA_FIELDS.map((field) => (
          <div
            key={field.key}
            className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
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
                      <p>This field is required.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </label>
            <Select
              value={columnMapping[field.key] || ""}
              onValueChange={(value) =>
                updateMapping(field.key, value === "unmapped" ? null : value)
              }
            >
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="Select Column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unmapped">Unmapped</SelectItem>
                {filteredColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
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
        <Button
          variant="outline"
          onClick={clearMappings}
          className="hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear Mappings
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValidMapping()}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Continue Import
        </Button>
      </div>
    </div>
  );
}
