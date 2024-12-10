'use client';

import { useState } from 'react';
import ModalOutput from '@/components/modal/ModalOutput';
import ModalForm from '@/components/modal/ModalForm';
import NavBar from '@/components/modal/NavBar';
import * as z from "zod";
import { ErrorBoundary } from 'react-error-boundary';

const formSchema = z.object({
  prompt: z.string().min(2, {
    message: "Prompt must be at least 2 characters.",
  }),
});

export default function ModalFrontend() {
  const [prompt, setPrompt] = useState('');
  const surprisePrompts = [
    "A steampunk-inspired flying machine in the clouds",
    "A futuristic cityscape with hovering vehicles",
    "An underwater scene with bioluminescent creatures",
  ];
  const [randomIndex] = useState(() => Math.floor(Math.random() * surprisePrompts.length));
  const [image, setImage] = useState<string | null>(null);
  const [PredictionLoading, setPredictionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newPrompt = surprisePrompts[randomIndex];
  const placeholderPrompt = "A koala chilling on a tree";

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      formSchema.parse(values);
      
      setPredictionLoading(true);
      setError(null);
      setImage(null);

      const formData = new FormData();
      formData.append('prompt', values.prompt);

      const res = await fetch('/api/modal', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Generation failed');
      }

      const data = await res.json();
      setImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setPredictionLoading(false);
    }
  }

  return (
    <ErrorBoundary fallback={<div>An error occurred</div>}>
      <NavBar />
      <main className="max-w-4xl mx-auto p-4 space-y-8">
        <div className="min-h-[512px] w-full rounded-xl bg-muted/50 p-4">
        <ModalOutput
            image={image}
            error={error}
            PredictionLoading={PredictionLoading}
            prompt={prompt}
          />
        </div>
        
        <ModalForm
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          PredictionLoading={PredictionLoading}
          placeholderPrompt={placeholderPrompt}
          newPrompt={newPrompt}
        />
      </main>
    </ErrorBoundary>
  );
}