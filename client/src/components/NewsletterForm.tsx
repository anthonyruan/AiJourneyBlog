import { useState } from "react";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SubscribeFormValues = z.infer<typeof subscribeSchema>;

export default function NewsletterForm() {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const form = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: "",
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscribeFormValues) => {
      const resp = await apiRequest("POST", "/api/subscribers", data);
      return resp.json();
    },
    onSuccess: () => {
      form.reset();
      setIsSubscribed(true);
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to subscribe: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscribeFormValues) => {
    subscribeMutation.mutate(data);
  };

  return (
    <section className="bg-primary-700 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="rounded-xl bg-primary-800 overflow-hidden shadow-xl py-10 px-6 sm:px-12">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white font-heading sm:text-3xl">
              Stay Updated
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-primary-200 sm:mt-4">
              Subscribe to get notified about new posts and projects
            </p>
          </div>
          
          {isSubscribed ? (
            <div className="mt-8 text-center">
              <div className="bg-primary-700/50 rounded-md p-4 mx-auto max-w-md">
                <p className="text-white font-medium">
                  Thanks for subscribing! You'll receive updates when new content is published.
                </p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 sm:flex justify-center">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-full sm:max-w-xs">
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          autoComplete="email"
                          className="w-full px-5 py-3 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500 border-primary-300 rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <Button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </section>
  );
}
