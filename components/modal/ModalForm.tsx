'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RotateCcw, Loader2 } from "lucide-react";
import { LightIcon, TabIcon } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface ModalFormProps {
  prompt: string;
  setPrompt: (text: string) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  PredictionLoading: boolean;
  placeholderPrompt: string;
  newPrompt: string;
}

const formSchema = z.object({
  prompt: z.string().min(2, {
    message: "Prompt must be at least 2 characters.",
  }),
});

export default function ModalForm({
  prompt,
  setPrompt,
  onSubmit,
  PredictionLoading,
  placeholderPrompt,
  newPrompt,
}: ModalFormProps) {
  const [isPlaceholderActive, setIsPlaceholderActive] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: prompt,
    },
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    } else if (event.key === 'Tab' && isPlaceholderActive) {
      event.preventDefault();
      const newValue = placeholderPrompt;
      form.setValue('prompt', newValue);
      setIsPlaceholderActive(false);
      setPrompt(newValue);
    }
  };

  const handleSurpriseMe = () => {
    form.setValue('prompt', newPrompt);
    setIsPlaceholderActive(false);
    setPrompt(newPrompt);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(form.getValues().prompt);
      toast({
        title: "Copied to clipboard",
        description: "The prompt has been copied to your clipboard.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error copying text:', error);
      toast({
        title: "Failed to copy text",
        description: "Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleRestart = () => {
    form.reset();
    setPrompt("");
    setIsPlaceholderActive(true);
  };

  const promptValue = form.watch("prompt");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [promptValue]);


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-2xl mx-auto p-4 bg-background rounded-lg border focus-within:ring-1 focus-within:ring-ring flex flex-col"
      >
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem className="flex-grow relative">
              <FormControl>
                <div className="flex flex-col rounded-xl overflow-hidden">
                  <Textarea
                    {...field}
                    ref={textareaRef}
                    className="resize-none border-0 p-3 shadow-none focus-visible:ring-0 text-lg bg-transparent leading-[2.5]"
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                      field.onChange(e);
                      setIsPlaceholderActive(e.target.value === "");
                      setPrompt(e.target.value);
                    }}
                    disabled={PredictionLoading}
                  />
                  {isPlaceholderActive && (
                    <div className="absolute top-0 left-0 p-3 pointer-events-none flex items-center text-muted-foreground">
                      <span className="mr-3 text-lg leading-relaxed">{placeholderPrompt}</span>
                      <TabIcon className="h-12 w-12 translate-y-[1px]" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                      {field.value && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  onClick={handleCopy}
                                  disabled={PredictionLoading}
                                  className="bg-background hover:bg-muted text-foreground rounded-full w-10 h-10 p-0"
                                >
                                  <Copy className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy prompt</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  onClick={handleRestart}
                                  className="bg-background hover:bg-muted text-foreground rounded-full w-10 h-10 p-0"
                                >
                                  <RotateCcw className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Restart</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="submit"
                            className="bg-background hover:bg-muted text-foreground rounded-full px-4 py-2 flex items-center gap-2"
                            disabled={PredictionLoading}
                            onClick={isPlaceholderActive ? handleSurpriseMe : undefined}
                          >
                            {isPlaceholderActive ? (
                              <>
                                <LightIcon className="h-6 w-6 text-yellow-400" />
                                Surprise me
                              </>
                            ) : PredictionLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              'Generate'
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isPlaceholderActive ? "Get a random prompt" : PredictionLoading ? "Generating..." : "Generate image"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}