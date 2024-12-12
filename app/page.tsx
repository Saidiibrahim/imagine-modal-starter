'use client';

import { useState, useEffect } from 'react';
import ModalOutput from '@/components/modal/ModalOutput';
import ModalForm from '@/components/modal/ModalForm';
import NavBar from '@/components/modal/NavBar';
import * as z from "zod";
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'react-toastify';

const MODAL_URL = process.env.NEXT_PUBLIC_MODAL_URL;

const formSchema = z.object({
  prompt: z.string().min(2, {
    message: "Prompt must be at least 2 characters.",
  }),
});

export default function ModalFrontend() {
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      formSchema.parse(values);
      
      setPredictionLoading(true);
      setError(null);
      setImage(null);

      const formData = new FormData();
      formData.append('prompt', values.prompt);

      const generateResponse = await fetch(`${MODAL_URL}/generate`, {
        method: 'POST',
        body: formData,
      });
      
      if (!generateResponse.ok) {
        throw new Error('Generation failed');
      }

      const { call_id } = await generateResponse.json();
      
      let attempts = 0;
      while (attempts < 30) {
        const resultResponse = await fetch(`${MODAL_URL}/result?call_id=${call_id}`);
        
        if (resultResponse.status === 200) {
          const imageBuffer = await resultResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const elapsedTime = resultResponse.headers.get('X-Elapsed-Time');
          console.log('elapsedTime:',elapsedTime);
          
          setImage(`data:image/png;base64,${base64Image}`);
          toast.success(`Image generated successfully!`, {
            position: "top-right",
            autoClose: 3000, // 3 seconds
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: { background: '#4ade80', color: '#052e16' },
          });
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      if (attempts >= 30) {
        throw new Error('Generation timed out');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      toast.error('Failed to generate image. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
