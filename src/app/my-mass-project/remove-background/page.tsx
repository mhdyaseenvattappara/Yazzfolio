
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Scissors, Download, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { removeBackground } from '@/ai/flows/remove-background-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RemoveBackgroundPage() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setOriginalImage(file);
      setResultImage(null);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => setOriginalPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload an image file (e.g., PNG, JPG).',
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
  });

  const handleRemoveBackground = async () => {
    if (!originalImage) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload an image first.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(originalImage);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
            const result = await removeBackground({ image: base64data });
            
            if (result.image) {
              setResultImage(result.image);
              toast({
                title: 'Success!',
                description: 'Background removed successfully.',
              });
            } else if (result.error) {
              setError(result.error);
            } else {
               const errorMessage = 'The AI model did not return an image.';
               setError(errorMessage);
               toast({
                    variant: 'destructive',
                    title: 'An Error Occurred',
                    description: errorMessage,
                });
            }
        } catch (err: any) {
            console.error('Background removal failed:', err);
            const errorMessage = err.message || 'Could not remove background.';
            setError(errorMessage);
            toast({
                variant: 'destructive',
                title: 'An Error Occurred',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
      };
    } catch (err: any) {
        console.error('File reading failed:', err);
        setError('Failed to read the image file.');
        toast({
            variant: 'destructive',
            title: 'File Error',
            description: 'Could not read the selected image file.',
        });
        setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'background-removed.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">AI Background Remover</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Upload an image and let AI automatically remove the background for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Side: Upload and Original Image */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2"><ImageIcon className="w-6 h-6 text-primary"/> Original Image</h3>
            {originalPreview ? (
              <div className="relative aspect-square w-full rounded-lg border bg-muted/20 overflow-hidden">
                <Image src={originalPreview} alt="Original" fill className="object-contain" />
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={cn(
                  'aspect-square w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors',
                  isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50'
                )}
              >
                <input {...getInputProps()} />
                <div className="p-8">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    {isDragActive ? 'Drop the image here...' : 'Drag & drop an image, or click to select'}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </div>
            )}
             <Button onClick={handleRemoveBackground} disabled={!originalImage || isLoading} className="w-full text-lg py-6">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Scissors className="mr-2 h-5 w-5" />
                  Remove Background
                </>
              )}
            </Button>
          </div>

          {/* Right Side: Result Image */}
          <div className="space-y-4">
             <h3 className="text-xl font-semibold flex items-center gap-2"><Scissors className="w-6 h-6 text-primary"/> Result</h3>
            <div className="relative aspect-square w-full rounded-lg border bg-muted/20 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, #ccc 0 25%, transparent 0 50%)', backgroundSize: '20px 20px' }}></div>
              {isLoading ? (
                <div className="text-center text-muted-foreground">
                  <Loader2 className="h-12 w-12 animate-spin" />
                  <p className="mt-4">Removing background...</p>
                </div>
              ) : resultImage ? (
                <Image src={resultImage} alt="Background removed" fill className="object-contain z-10" />
              ) : error ? (
                <div className="p-4 text-center text-destructive-foreground bg-destructive/80 rounded-md z-10 m-4">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-semibold">Processing Failed</p>
                    <p className="text-sm">{error}</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground z-10 p-4">
                  <p>The result will appear here.</p>
                </div>
              )}
            </div>
            <Button onClick={downloadImage} disabled={!resultImage || isLoading} className="w-full text-lg py-6">
              <Download className="mr-2 h-5 w-5" />
              Download Image
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
