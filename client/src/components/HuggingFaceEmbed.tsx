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
    <Card className="mb-5 border border-gray-200 w-full">
      <CardHeader className="bg-blue-100 pb-3">
        <div className="flex items-center">
          <img 
            src="https://huggingface.co/favicon.ico" 
            alt="Hugging Face logo" 
            className="w-6 h-6 mr-2" 
          />
          <CardTitle className="text-base font-medium text-gray-800">
            Hugging Face Space
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="text-gray-800 mb-4 text-center font-medium text-xl">{title}</div>
        <div className="space-y-4">
          <Textarea
            placeholder={placeholderText}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition-colors text-base"
          />
          
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateClick}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
          
          {outputText && (
            <div className="mt-5 text-left p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-700 whitespace-pre-wrap text-base">
              {outputText}
            </div>
          )}
          
          <div className="mt-3 text-sm text-gray-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <a href={modelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
              View full model on Hugging Face
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
