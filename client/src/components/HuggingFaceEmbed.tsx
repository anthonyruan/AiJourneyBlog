import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HuggingFaceEmbedProps {
  title: string;
  modelUrl: string;
  placeholderText: string;
}

export default function HuggingFaceEmbed({ 
  title, 
  modelUrl, 
  placeholderText 
}: HuggingFaceEmbedProps) {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // In a real application, this would call the Hugging Face API
  // Here we're just simulating the behavior
  const handleGenerateClick = () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // This is where you would call the actual Hugging Face API
      setOutputText(`Generated text based on: "${inputText}"\n\nThis is a simulated response. In a real application, this would come from the Hugging Face model API.`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="mb-5 border border-gray-200">
      <CardHeader className="bg-gray-50 pb-3">
        <div className="flex items-center">
          <img 
            src="https://huggingface.co/favicon.ico" 
            alt="Hugging Face logo" 
            className="w-5 h-5 mr-2" 
          />
          <CardTitle className="text-sm font-medium text-gray-700">
            Hugging Face Space
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="text-gray-600 mb-2 text-center font-medium">{title}</div>
        <div className="space-y-3">
          <Textarea
            placeholder={placeholderText}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-colors"
          />
          
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateClick}
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
          
          {outputText && (
            <div className="mt-4 text-left p-3 bg-gray-50 rounded border border-gray-200 text-gray-600 whitespace-pre-wrap">
              {outputText}
            </div>
          )}
          
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <a href={modelUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
              View full model on Hugging Face
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
