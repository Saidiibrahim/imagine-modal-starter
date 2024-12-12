import Image from "next/image";

interface ModalOutputProps {
  image: string | null;
  error: string | null;
  PredictionLoading: boolean;
  prompt: string;
}

export default function ModalOutput({
  image,
  error,
  PredictionLoading,
  prompt,
}: ModalOutputProps) {
  const isEmpty = !image && !error && !PredictionLoading;
  const shouldCenter = isEmpty || PredictionLoading;

  return (
    <div
      className={`flex-1 flex flex-col items-center overflow-auto p-4 ${
        shouldCenter ? "justify-center" : "justify-start"
      }`}
    >
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : image ? (
        <Image
          src={image}
          alt={prompt}
          width={512}
          height={512}
          className="rounded-lg shadow-lg max-w-full h-auto"
          priority
        />
        ) : PredictionLoading ? ( 
        <p>Generating...</p>
      ) : (
        <p className="text-muted-foreground">
          Enter a prompt to generate an image
        </p>
      )}
    </div>
  );
}

