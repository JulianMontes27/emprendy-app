"use client";

import axios from "axios";
import useModalStore from "@/hooks/use-store-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Form Schema for Validation
const formSchema = z.object({
  campaignName: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  contactList: z.string().min(1, "Contact list is required"),
  template: z.string().min(1, "Template is required"),
  subject: z.string().min(1, "Subject line is required"),
  emailBody: z.string().min(1, "Email body is required"),
  scheduleDate: z.date().optional(),
  isScheduled: z.boolean().default(false),
});

type CreateCampaignModalType = z.infer<typeof formSchema>;

export default function CreateCampaignModal() {
  const { isOpen, onClose, modalType, data } = useModalStore();
  const router = useRouter();

  console.log(data.contactLists);

  const form = useForm<CreateCampaignModalType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignName: "",
      description: "",
      contactList: "",
      template: "",
      subject: "",
      emailBody: "",
      scheduleDate: undefined,
      isScheduled: false,
    },
  });

  const onSubmit = async (values: CreateCampaignModalType) => {
    try {
      // Send data to the backend
      await axios.post("/api/campaigns", values).then(() => {
        toast.success("Campaña creada!");
        router.refresh();
        onClose();
      });
    } catch (error) {
      toast.error("Algo salió mal. Intenta otra vez.");
      console.error(error);
    }
  };

  const isModalOpen = isOpen && modalType === "create-campaign";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Crear Campaña
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campaign Details */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="campaignName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la campaña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción breve sobre la campaña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact List Selection */}
            <FormField
              control={form.control}
              name="contactList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Contact List</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a contact list" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="prospects">Prospects</SelectItem>
                      <SelectItem value="clients">Clients</SelectItem>
                      <SelectItem value="new">Upload New List</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Template Selection */}
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Template</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="product-launch">
                        Product Launch
                      </SelectItem>
                      <SelectItem value="follow-up">Follow-Up</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Content */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject line" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailBody"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Body</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your email content here"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Scheduling */}
            <FormField
              control={form.control}
              name="isScheduled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule</FormLabel>
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant={!field.value ? "default" : "outline"}
                      onClick={() => field.onChange(false)}
                    >
                      Send Immediately
                    </Button>
                    <Button
                      type="button"
                      variant={field.value ? "default" : "outline"}
                      onClick={() => field.onChange(true)}
                    >
                      Schedule for Later
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("isScheduled") && (
              <FormField
                control={form.control}
                name="scheduleDate"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit">Create Campaign</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
