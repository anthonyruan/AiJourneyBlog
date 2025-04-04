import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";
import NewsletterForm from "@/components/NewsletterForm";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const resp = await apiRequest("POST", "/api/messages", data);
      return resp.json();
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: "Message sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };

  return (
    <>
      {/* Contact Header */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading sm:text-4xl">
              Get in Touch
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600">
              Have questions or suggestions? Leave a message or connect through social media
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="your@email.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your message here..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-heading text-gray-900">
              Connect on Social Media
            </h2>
            <p className="text-gray-600 mt-2">
              Find me on these platforms and let's stay in touch
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-xl mx-auto">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all"
            >
              <FaGithub className="text-4xl mb-2 text-gray-800" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
            
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all"
            >
              <FaTwitter className="text-4xl mb-2 text-blue-400" />
              <span className="text-sm font-medium">Twitter</span>
            </a>
            
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all"
            >
              <FaLinkedin className="text-4xl mb-2 text-blue-700" />
              <span className="text-sm font-medium">LinkedIn</span>
            </a>
            
            <a
              href="https://huggingface.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all"
            >
              <SiHuggingface className="text-4xl mb-2 text-yellow-600" />
              <span className="text-sm font-medium">Hugging Face</span>
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterForm />
    </>
  );
}
