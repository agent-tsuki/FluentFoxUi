'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Upload,
  Download,
  Image as ImageIcon,
  Loader2,
  FileImage,
  CheckCircle,
  AlertCircle,
  X,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { convertImage } from '@/lib/api';

interface ImageConverterProps {
  targetFormat: string;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface ConversionResult {
  id: string;
  originalName: string;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

export function ImageConverter({ targetFormat }: ImageConverterProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const formats = {
    jpeg: { label: 'JPEG', desc: 'High quality photos', mime: 'image/jpeg' },
    png: { label: 'PNG', desc: 'Lossless with transparency', mime: 'image/png' },
    webp: { label: 'WebP', desc: 'Modern web format', mime: 'image/webp' },
    avif: { label: 'AVIF', desc: 'Next-gen compression', mime: 'image/avif' },
    bmp: { label: 'BMP', desc: 'Windows bitmap', mime: 'image/bmp' },
    tiff: { label: 'TIFF', desc: 'Professional print', mime: 'image/tiff' },
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(2, 9)
      });
      return fileWithPreview;
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff']
    },
    multiple: true
  });

  const removeFile = (id: string) => {
    setFiles(files => files.filter(f => f.id !== id));
    setResults(results => results.filter(r => r.id !== id));
  };

  const convertFiles = async () => {
    if (files.length === 0) {
      toast.error('Please add some images to convert');
      return;
    }

    setIsProcessing(true);
    
    // Initialize results
    const initialResults: ConversionResult[] = files.map(file => ({
      id: file.id,
      originalName: file.name,
      targetFormat,
      status: 'pending',
      progress: 0
    }));
    
    setResults(initialResults);

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Update status to processing
        setResults(prev => prev.map(r => 
          r.id === file.id ? { ...r, status: 'processing', progress: 10 } : r
        ));

        // Convert the image
        const response = await convertImage(file, targetFormat, {
          quality: 85,
          progressive: true
        });

        if (response.success && response.data?.base64) {
          // Create download URL
          const binary = atob(response.data.base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: formats[targetFormat as keyof typeof formats]?.mime });
          const downloadUrl = URL.createObjectURL(blob);

          // Update result
          setResults(prev => prev.map(r => 
            r.id === file.id ? { 
              ...r, 
              status: 'completed', 
              progress: 100,
              downloadUrl 
            } : r
          ));

          toast.success(`${file.name} converted successfully!`);
        } else {
          throw new Error(response.message || 'Conversion failed');
        }
      } catch (error) {
        console.error('Conversion error:', error);
        
        setResults(prev => prev.map(r => 
          r.id === file.id ? { 
            ...r, 
            status: 'error', 
            progress: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          } : r
        ));

        toast.error(`Failed to convert ${file.name}`);
      }
    }

    setIsProcessing(false);
  };

  const downloadFile = (result: ConversionResult) => {
    if (!result.downloadUrl) return;
    
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = `${result.originalName.split('.')[0]}.${targetFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    files.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    results.forEach(result => {
      if (result.downloadUrl) URL.revokeObjectURL(result.downloadUrl);
    });
    setFiles([]);
    setResults([]);
  };

  const formatInfo = formats[targetFormat as keyof typeof formats];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-lg text-white">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Image to {formatInfo?.label} Converter
                  <Badge variant="secondary" className="text-xs">
                    {formatInfo?.label}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Convert images to {formatInfo?.label} format - {formatInfo?.desc}
                </CardDescription>
              </div>
            </div>
            
            {files.length > 0 && (
              <Button variant="outline" onClick={clearAll} size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* File Upload */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop your images here...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPEG, PNG, GIF, WebP, BMP, TIFF
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Images ({files.length})</CardTitle>
            <CardDescription>
              Images ready for conversion to {formatInfo?.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file) => {
              const result = results.find(r => r.id === file.id);
              
              return (
                <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {result && (
                      <div className="mt-2">
                        {result.status === 'processing' && (
                          <div className="space-y-1">
                            <Progress value={result.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">Converting...</p>
                          </div>
                        )}
                        
                        {result.status === 'completed' && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Converted successfully</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadFile(result)}
                              className="ml-auto"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}
                        
                        {result.status === 'error' && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">
                              {result.error || 'Conversion failed'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={isProcessing}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Convert Button */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <Button
                onClick={convertFiles}
                disabled={isProcessing}
                size="lg"
                className="min-w-48"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileImage className="w-5 h-5 mr-2" />
                    Convert to {formatInfo?.label}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}