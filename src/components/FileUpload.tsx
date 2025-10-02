'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface FileUploadProps {
  onFilesChange: (files: FileWithPreview[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesChange,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff'],
    'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'],
    'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'],
    'application/*': ['.pdf', '.zip', '.rar', '.7z'],
  },
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB default
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        console.log('Rejected files:', rejectedFiles);
        // You can add toast notifications here for rejected files
      }

      // Process accepted files
      const newFiles = acceptedFiles.map((file) => {
        const fileWithPreview = Object.assign(file, {
          id: Math.random().toString(36).substring(7),
          preview: file.type.startsWith('image/') 
            ? URL.createObjectURL(file) 
            : undefined,
        }) as FileWithPreview;

        return fileWithPreview;
      });

      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    },
    [files, maxFiles, onFilesChange]
  );

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter((file) => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Clean up preview URL
    const fileToRemove = files.find((file) => file.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const clearAllFiles = () => {
    // Clean up all preview URLs
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    onFilesChange([]);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    multiple: true,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📁';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer',
          isDragActive && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <Upload
            className={cn(
              'w-12 h-12 mb-4 text-muted-foreground',
              isDragActive && 'text-primary'
            )}
          />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select files
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>
        </div>
      </Card>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">
                Some files were rejected:
              </p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {fileRejections.map((rejection, index) => (
                <li key={index} className="flex justify-between">
                  <span>{rejection.file.name}</span>
                  <span>{rejection.errors[0]?.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Selected Files ({files.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                disabled={disabled}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                        onLoad={() => URL.revokeObjectURL(file.preview!)}
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center text-2xl">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {file.type || 'Unknown'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    {uploadProgress[file.id] !== undefined && (
                      <Progress 
                        value={uploadProgress[file.id]} 
                        className="mt-2 h-2"
                      />
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={disabled}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}