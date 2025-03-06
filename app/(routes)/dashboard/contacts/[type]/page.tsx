"use client";

import * as XLSX from "xlsx";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ColumnMappingModal } from "../../_components/contacts/column-mapping-modal";
import { unknown } from "zod";

interface ImportPageProps {
  params: {
    type: string;
  };
}

const ImportPage: React.FC<ImportPageProps> = ({ params }) => {
  const [importType, setImportType] = useState(params.type || "excel");
  const [file, setFile] = useState<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [showMapping, setShowMapping] = useState(false);

  const router = useRouter();

  // Handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  // Get accepted file types
  const getAcceptedFileTypes = () => {
    switch (importType) {
      case "excel":
        return ".xlsx,.xls";
      case "google_sheets":
        return ".csv";
      default:
        return "";
    }
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  };

  // Process uploaded file
  const processFile = async (file: File) => {
    setFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Returns an array of arrays, where each inner array represents a row in the sheet
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // The first row of the raw data (rawData[0]) contains the column headers
      const columns = rawData[0] as string[];

      // For each row after the header row (rawData.slice(1)), map the values to their corresponding column headers
      const data = rawData.slice(1).map((row) => {
        const rowData: Record<string, any> = {};
        columns.forEach((col, index) => {
          rowData[col] = (row as any[])[index];
        });
        return rowData;
      });

      // Filter out rows where all values are empty or N/A
      const filteredData = data.filter((row) => {
        return Object.values(row).some(
          (value) => value !== undefined && value !== null && value !== ""
        );
      });

      setExcelColumns(columns);
      setRawData(filteredData); // Use filteredData instead of raw data
    } catch (error) {
      console.error("Error processing file:", error);
      alert(
        "Failed to process the file. Please ensure it is a valid Excel or CSV file."
      );
    }
  };

  // Handle import type change
  const handleImportTypeChange = (value: string) => {
    setImportType(value);
    router.push(`/dashboard/contacts/${value}`);
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setExcelColumns([]);
    setRawData([]);
  };

  // Get import type icon
  const getImportTypeIcon = () => {
    switch (importType) {
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
      case "google_sheets":
        return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get import type label
  const getImportTypeLabel = () => {
    switch (importType) {
      case "excel":
        return "MS Excel";
      case "google_sheets":
        return "Google Sheets";
      case "manual":
        return "manualmente";
      default:
        return importType;
    }
  };

  // Handle mapping completion
  const handleMappingComplete = async (mapping: Record<string, string>) => {
    const processedContacts = rawData.map((row) => {
      const contact: Record<string, any> = {};
      Object.entries(mapping).forEach(([schemaField, excelColumn]) => {
        if (excelColumn) {
          contact[schemaField] = row[excelColumn];
        }
      });
      return contact;
    });

    const formData = new FormData();
    formData.append("file", file!);
    formData.append("mappedContacts", JSON.stringify(processedContacts));

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / (progressEvent.total || 1)) * 100
          );
          setUploadProgress(progress);
        },
      });
      console.log("Upload response:", response);
    } catch (error) {
      console.error("Upload error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
      }
    } finally {
      setIsUploading(false);
    }
  };

  console.log(rawData);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Importar contactos
        </h1>
        <p className="text-muted-foreground">
          Importa tus contactos de varias fuentes.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1: Select Import Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary/10 p-1.5 rounded-full">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
              </span>
              Selecciona el método de importación
            </CardTitle>
            <CardDescription>
              Escoge cómo vas a importar tus contactos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={handleImportTypeChange}
              defaultValue={importType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                  <span>Hoja de MS Excel</span>
                </SelectItem>
                <SelectItem value="google_sheets">
                  <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                  <span>Google Sheets</span>
                </SelectItem>
                <SelectItem value="manual">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Entrada manual</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Step 2: Upload File or Manual Entry */}
        {importType !== "manual" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary/10 p-1.5 rounded-full">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    2
                  </span>
                </span>
                Sube tu archivo
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {getImportTypeIcon()}
                <span>Sube tu archivo de {getImportTypeLabel()}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Formatos de archivo válidos:{" "}
                        {importType === "excel" ? ".xlsx, .xls" : ".csv"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">
                      Arrastra y suelta tu archivo aquí
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground max-w-xs">
                      O haz clic en el botón de abajo para explorar tus archivos
                    </p>
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      Seleccionar archivos
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept={getAcceptedFileTypes()}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getImportTypeIcon()}
                      <div>
                        <p className="font-medium truncate max-w-[200px] sm:max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remover archivo</span>
                    </Button>
                  </div>

                  {/* Table Preview */}
                  {excelColumns.length > 0 && rawData.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-4">
                        Vista previa de los datos
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border">
                          <thead>
                            <tr className="bg-gray-100">
                              {excelColumns.map((column, index) => (
                                <th
                                  key={index}
                                  className="border p-2 text-left"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rawData.slice(0, 5).map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                className={`border ${
                                  rowIndex % 2 === 0 ? "bg-gray-50" : ""
                                }`}
                              >
                                {excelColumns.map((column, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className="border p-2 text-left"
                                  >
                                    {row[column] || "N/A"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Subiendo</span>
                        <span className="text-sm text-muted-foreground">
                          {uploadProgress}%
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {uploadProgress === 100 && !isUploading && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      Listo para importar
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button
                onClick={() => setShowMapping(true)}
                disabled={!file || isUploading}
              >
                {isUploading ? "Importando..." : "Continuar"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary/10 p-1.5 rounded-full">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    2
                  </span>
                </span>
                Entrada manual
              </CardTitle>
              <CardDescription>
                Ingresa la información de tus contactos manualmente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Podrás añadir contactos uno por uno en la próxima página (haz
                clic en continuar).
              </p>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6 w-full">
              <Button
                onClick={() => setShowMapping(true)}
                disabled={isUploading}
              >
                {isUploading ? "Importando..." : "Continuar"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Column Mapping Modal */}
      {showMapping && (
        <ColumnMappingModal
          excelColumns={excelColumns}
          rawData={rawData}
          onMappingComplete={handleMappingComplete}
        />
      )}
    </div>
  );
};

export default ImportPage;
