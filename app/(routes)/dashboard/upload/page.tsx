import getSession from "@/lib/get-session";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUp, BookText, LinkIcon } from "lucide-react";

const UploadDocPage = async () => {
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Upload Document</h1>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="google">Google Sheets</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Upload Excel File</CardTitle>
              <CardDescription>
                Upload an Excel spreadsheet (.xlsx, .xls) to import your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action="/api/upload"
                method="POST"
                encType="multipart/form-data"
              >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="mx-auto flex flex-col items-center justify-center gap-1">
                    <ArrowUp className="h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: .xlsx, .xls (max 10MB)
                    </p>
                    <Input
                      id="file-upload"
                      name="file"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="file-name">Document Name</Label>
                  <Input
                    type="text"
                    id="file-name"
                    name="name"
                    placeholder="Enter a name for this document"
                    className="mb-4"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="Add a description for your document"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button type="submit" form="file-upload">
                Upload Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="google">
          <Card>
            <CardHeader>
              <CardTitle>Import Google Sheet</CardTitle>
              <CardDescription>
                Connect to a Google Sheet by entering the share URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action="/api/import-google-sheet"
                method="POST"
                id="google-sheet-form"
              >
                <div className="mb-6">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="sheet-url">Google Sheet URL</Label>
                    <div className="flex w-full items-center space-x-2">
                      <LinkIcon className="h-5 w-5 text-gray-400" />
                      <Input
                        type="url"
                        id="sheet-url"
                        name="url"
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="flex-1"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Make sure your sheet is shared with view access
                    </p>
                  </div>
                </div>

                <div className="grid w-full items-center gap-1.5 mb-4">
                  <Label htmlFor="sheet-name">Document Name</Label>
                  <Input
                    type="text"
                    id="sheet-name"
                    name="name"
                    placeholder="Enter a name for this document"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="sheet-description">
                    Description (Optional)
                  </Label>
                  <textarea
                    id="sheet-description"
                    name="description"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="Add a description for your document"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button type="submit" form="google-sheet-form">
                Import Sheet
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Upload Guidelines</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>Files must be in .xlsx or .xls format</li>
          <li>Maximum file size is 10MB</li>
          <li>
            For Google Sheets, make sure the sheet is shared with view access
          </li>
          <li>First row should contain column headers</li>
          <li>Data should be well-structured for best results</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadDocPage;
