'use client';

import { useState, ChangeEvent, useRef, DragEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Upload, X, Crop, Link2, GalleryHorizontal, Square, RectangleHorizontal, RectangleVertical, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';


interface ImageUploadProps {
  initialImageUrl?: string | null;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  uploadProgress?: number;
  isUploading?: boolean;
  aspectRatio?: number;
}

const MAX_DIMENSION = 2048;

export function ImageUpload({
  initialImageUrl,
  onFileChange,
  onUrlChange,
  uploadProgress,
  isUploading,
  aspectRatio: initialAspectRatio,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(initialAspectRatio);
  const [isCropping, setIsCropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState(initialImageUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    setPreview(initialImageUrl || null);
    setUrlInput(initialImageUrl || '');
  }, [initialImageUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio || width / height,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
  };

  const handleCropComplete = async () => {
    if (!sourceImage || !imgRef.current || !completedCrop || !completedCrop.width || !completedCrop.height) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    
    // Crucial: Use natural resolution to avoid clipping/blurring
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Optimized Resizing for web usage
    let finalCanvas = canvas;
    if (canvas.width > MAX_DIMENSION || canvas.height > MAX_DIMENSION) {
        const resizeCanvas = document.createElement('canvas');
        const resizeCtx = resizeCanvas.getContext('2d');
        if (!resizeCtx) return;

        let { width, height } = canvas;
        if (width > height) {
            if (width > MAX_DIMENSION) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
            }
        } else {
            if (height > MAX_DIMENSION) {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
            }
        }

        resizeCanvas.width = width;
        resizeCanvas.height = height;
        resizeCtx.drawImage(canvas, 0, 0, width, height);
        finalCanvas = resizeCanvas;
    }

    finalCanvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'upload.jpeg', { type: 'image/jpeg' });
        onFileChange(croppedFile);
        const objectUrl = URL.createObjectURL(croppedFile)
        setPreview(objectUrl);
        onUrlChange('');
      }
      setIsCropping(false);
      setSourceImage(null);
    }, 'image/jpeg', 0.9);
  };
  
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value;
      setUrlInput(newUrl);
      onUrlChange(newUrl);
      setPreview(newUrl);
      onFileChange(null);
  }

  const handleRemoveImage = () => {
    setPreview(null);
    onFileChange(null);
    onUrlChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSourceImage(reader.result as string);
            setIsCropping(true);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAspectChange = (value: string) => {
    let newAspect: number | undefined = undefined;
    switch(value) {
        case '1': newAspect = 1; break;
        case '16/9': newAspect = 16/9; break;
        case '9/16': newAspect = 9/16; break;
        case 'original': 
            if(imgRef.current) {
                newAspect = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
            }
            break;
        default: newAspect = undefined;
    }
    setAspectRatio(newAspect);

    if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, newAspect || width / height, width, height),
            width, height
        );
        setCrop(newCrop);
    }
  }

  return (
    <div className="space-y-4">
      <Dialog open={isCropping} onOpenChange={setIsCropping}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Fine-tune Visual</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4 items-center'>
            {sourceImage && (
                <div className="flex justify-center w-full overflow-hidden bg-muted/20 rounded-lg">
                <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    onComplete={c => setCompletedCrop(c)}
                    aspect={aspectRatio}
                    className='max-h-[60vh]'
                >
                    <img
                    ref={imgRef}
                    src={sourceImage}
                    alt="Crop preview"
                    onLoad={handleImageLoad}
                    style={{ maxHeight: '60vh', objectFit: 'contain', width: '100%' }}
                    />
                </ReactCrop>
                </div>
            )}
            <ToggleGroup type="single" onValueChange={handleAspectChange} size="sm" className="bg-muted p-1 rounded-full">
                <ToggleGroupItem value="original" className="rounded-full">
                    <GalleryHorizontal className="h-4 w-4 mr-2" /> Original
                </ToggleGroupItem>
                <ToggleGroupItem value="1" className="rounded-full">
                    <Square className="h-4 w-4 mr-2" /> 1:1
                </ToggleGroupItem>
                <ToggleGroupItem value="16/9" className="rounded-full">
                    <RectangleHorizontal className="h-4 w-4 mr-2" /> 16:9
                </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCropping(false)}>Cancel</Button>
            <Button onClick={handleCropComplete}>Save Selection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {preview && (
        <div className="w-full h-64 relative rounded-2xl flex items-center justify-center bg-muted/40 border-2 border-dashed overflow-hidden group">
            <Image
                src={preview}
                alt="Image preview"
                fill
                className="object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="rounded-full h-10 w-10 shadow-xl"
                    onClick={handleRemoveImage}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>
      )}

      {!preview && (
        <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-full h-12 p-1">
            <TabsTrigger value="upload" className="rounded-full">Upload File</TabsTrigger>
            <TabsTrigger value="url" className="rounded-full">Direct Link</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
                <div 
                    className={cn(
                        "w-full h-40 relative border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-muted/20 transition-all cursor-pointer hover:bg-accent/10 hover:border-primary/50",
                        isDragging && "bg-accent/30 border-primary scale-[0.98]"
                    )}
                    onClick={handleSelectImage}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Click or drop image here</p>
                    <p className="text-xs text-muted-foreground mt-1">High quality PNG or JPG preferred</p>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </TabsContent>
            <TabsContent value="url">
                <div className="pt-2">
                    <Input 
                        type="text" 
                        placeholder="Paste image URL here..." 
                        value={urlInput}
                        onChange={handleUrlInputChange}
                        className="h-12 rounded-full px-6"
                    />
                </div>
            </TabsContent>
        </Tabs>
      )}

      {isUploading && (
        <div className="space-y-3 bg-accent/10 p-4 rounded-2xl border border-primary/10">
          <div className="flex justify-between items-center text-xs font-bold text-primary uppercase tracking-wider">
            <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Optimizing & Uploading...
            </span>
            <span>{Math.round(uploadProgress || 0)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}
    </div>
  );
}
