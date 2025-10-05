'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Settings, Zap, Image as ImageIcon, Video, Music, FileArchive } from 'lucide-react';
import { toast } from 'sonner';
import { 
  convertImage, 
  convertVideo, 
  convertAudio, 
  encodeFileToBase64,
  testConnection,
  ConversionResponse 
} from '@/lib/api';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface ConversionPanelProps {
  files: FileWithPreview[];
  onConversionComplete?: (result: ConversionResponse) => void;
}

export function ConversionPanel({ files, onConversionComplete }: ConversionPanelProps) {
  const [activeTab, setActiveTab] = useState('image');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ConversionResponse[]>([]);

  // Image conversion options
  const [imageFormat, setImageFormat] = useState('png');
  const [imageQuality, setImageQuality] = useState(80);
  const [imageWidth, setImageWidth] = useState<number | undefined>();
  const [imageHeight, setImageHeight] = useState<number | undefined>();

  // Video conversion options
  const [videoFormat, setVideoFormat] = useState('mp4');
  const [videoQuality, setVideoQuality] = useState('medium');

  // Audio conversion options
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [audioBitrate, setAudioBitrate] = useState('192k');

  // Download function
  const handleDownload = (result: ConversionResponse) => {
    if (!result.success || !result.data?.base64 || !result.data?.filename) {
      toast.error('No file data available for download');
      return;
    }

    try {
      // Convert base64 to blob
      const binaryString = atob(result.data.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { 
        type: result.data.format || 'application/octet-stream' 
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${result.data.filename}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  // Connection test function
  const handleConnectionTest = async () => {
    try {
      toast.info('Testing connection...');
      const result = await testConnection();
      
      console.log('🔍 Connection Test Results:', result);
      
      if (result.axios && result.fetch) {
        toast.success('Connection successful (both axios and fetch)');
      } else if (result.fetch) {
        toast.success('Connection successful (fetch only - axios blocked)');
      } else if (result.axios) {
        toast.success('Connection successful (axios only)');
      } else {
        toast.error('Connection failed (both axios and fetch)');
      }
      
      // Log detailed results
      console.table({
        'Axios': result.axios ? 'Working' : 'Failed',
        'Fetch': result.fetch ? 'Working' : 'Failed',
        'Axios Error': result.details.axios?.error || 'None',
        'Fetch Error': result.details.fetch?.error || 'None',
      });
      
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed');
    }
  };

  const imageFormats = [
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPEG' },
    { value: 'webp', label: 'WebP' },
    { value: 'avif', label: 'AVIF' },
    { value: 'bmp', label: 'BMP' },
    { value: 'tiff', label: 'TIFF' },
  ];

  const videoFormats = [
    { value: 'mp4', label: 'MP4' },
    { value: 'avi', label: 'AVI' },
    { value: 'mov', label: 'MOV' },
    { value: 'mkv', label: 'MKV' },
    { value: 'webm', label: 'WebM' },
  ];

  const audioFormats = [
    { value: 'mp3', label: 'MP3' },
    { value: 'wav', label: 'WAV' },
    { value: 'ogg', label: 'OGG' },
    { value: 'flac', label: 'FLAC' },
    { value: 'm4a', label: 'M4A' },
  ];

  const videoQualities = [
    { value: 'low', label: 'Low (480p)' },
    { value: 'medium', label: 'Medium (720p)' },
    { value: 'high', label: 'High (1080p)' },
    { value: 'ultra', label: 'Ultra (4K)' },
  ];

  const audioBitrates = [
    { value: '128k', label: '128 kbps' },
    { value: '192k', label: '192 kbps' },
    { value: '256k', label: '256 kbps' },
    { value: '320k', label: '320 kbps' },
  ];

  const getFilesForType = (type: string) => {
    return files.filter(file => {
      if (type === 'image') return file.type.startsWith('image/');
      if (type === 'video') return file.type.startsWith('video/');
      if (type === 'audio') return file.type.startsWith('audio/');
      if (type === 'base64') return true; // Base64 can handle any file type
      return false;
    });
  };

  const handleImageConversion = async () => {
    const imageFiles = getFilesForType('image');
    if (imageFiles.length === 0) {
      toast.error('No image files selected');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const newResults: ConversionResponse[] = [];

    try {
      // Only show one initial message
      toast.info(`Converting ${imageFiles.length} image file(s)...`);

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        const result = await convertImage(
          file,
          {
            format: imageFormat,
            quality: imageQuality,
            width: imageWidth,
            height: imageHeight,
            optimization_level: 'medium',
            maintain_aspect_ratio: true,
            use_async: false,
          },
          (fileProgress) => {
            const totalProgress = ((i / imageFiles.length) * 100) + (fileProgress / imageFiles.length);
            setProgress(totalProgress);
          }
        );

        newResults.push(result);
        onConversionComplete?.(result);
      }

      setResults([...results, ...newResults]);
      // Only show one success message at the end
      toast.success(`Successfully converted ${imageFiles.length} image(s)`);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleVideoConversion = async () => {
    const videoFiles = getFilesForType('video');
    if (videoFiles.length === 0) {
      toast.error('No video files selected');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const newResults: ConversionResponse[] = [];

    try {
      // Only show one initial message
      toast.info(`Converting ${videoFiles.length} video file(s)...`);

      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];

        const result = await convertVideo(
          file,
          {
            format: videoFormat,
            quality: videoQuality, // This maps to quality_preset in the API
            codec: 'auto',
          },
          (fileProgress) => {
            const totalProgress = ((i / videoFiles.length) * 100) + (fileProgress / videoFiles.length);
            setProgress(totalProgress);
          }
        );

        newResults.push(result);
        onConversionComplete?.(result);
      }

      setResults([...results, ...newResults]);
      // Only show one success message at the end
      toast.success(`Successfully converted ${videoFiles.length} video(s)`);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleAudioConversion = async () => {
    const audioFiles = getFilesForType('audio');
    if (audioFiles.length === 0) {
      toast.error('No audio files selected');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const newResults: ConversionResponse[] = [];

    try {
      // Only show one initial message
      toast.info(`Converting ${audioFiles.length} audio file(s)...`);

      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];

        const result = await convertAudio(
          file,
          {
            format: audioFormat,
            bitrate: audioBitrate,
          },
          (fileProgress) => {
            const totalProgress = ((i / audioFiles.length) * 100) + (fileProgress / audioFiles.length);
            setProgress(totalProgress);
          }
        );

        newResults.push(result);
        onConversionComplete?.(result);
      }

      setResults([...results, ...newResults]);
      // Only show one success message at the end
      toast.success(`Successfully converted ${audioFiles.length} audio file(s)`);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleBase64Conversion = async () => {
    if (files.length === 0) {
      toast.error('No files selected');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const newResults: ConversionResponse[] = [];

    try {
      // Only show one initial message
      toast.info(`Encoding ${files.length} file(s) to Base64...`);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const result = await encodeFileToBase64(
          file,
          { url_safe: false },
          (fileProgress) => {
            const totalProgress = ((i / files.length) * 100) + (fileProgress / files.length);
            setProgress(totalProgress);
          }
        );

        newResults.push(result);
        onConversionComplete?.(result);
      }

      setResults([...results, ...newResults]);
      // Only show one success message at the end
      toast.success(`Successfully encoded ${files.length} file(s) to Base64`);
    } catch (error) {
      console.error('Encoding error:', error);
      toast.error('Encoding failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-medium">Ready to Convert</p>
            <p className="text-muted-foreground">Upload files to start processing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Conversion Settings
            </CardTitle>
            <CardDescription>
              Choose your conversion options and start processing
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnectionTest}
            className="text-xs"
          >
            Test API Connection
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Images ({getFilesForType('image').length})
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Videos ({getFilesForType('video').length})
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Audio ({getFilesForType('audio').length})
            </TabsTrigger>
            <TabsTrigger value="base64" className="flex items-center gap-2">
              <FileArchive className="w-4 h-4" />
              Base64 ({files.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <Select value={imageFormat} onValueChange={setImageFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {imageFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Quality (%)</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={imageQuality}
                  onChange={(e) => setImageQuality(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Width (px)</label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={imageWidth || ''}
                  onChange={(e) => setImageWidth(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Height (px)</label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={imageHeight || ''}
                  onChange={(e) => setImageHeight(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
            <Button 
              onClick={handleImageConversion} 
              disabled={isProcessing || getFilesForType('image').length === 0}
              className="w-full"
            >
              Convert Images
            </Button>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <Select value={videoFormat} onValueChange={setVideoFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Quality</label>
                <Select value={videoQuality} onValueChange={setVideoQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoQualities.map((quality) => (
                      <SelectItem key={quality.value} value={quality.value}>
                        {quality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleVideoConversion} 
              disabled={isProcessing || getFilesForType('video').length === 0}
              className="w-full"
            >
              Convert Videos
            </Button>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <Select value={audioFormat} onValueChange={setAudioFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audioFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Bitrate</label>
                <Select value={audioBitrate} onValueChange={setAudioBitrate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audioBitrates.map((bitrate) => (
                      <SelectItem key={bitrate.value} value={bitrate.value}>
                        {bitrate.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleAudioConversion} 
              disabled={isProcessing || getFilesForType('audio').length === 0}
              className="w-full"
            >
              Convert Audio
            </Button>
          </TabsContent>

          <TabsContent value="base64" className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Convert any file type to Base64 encoding
              </p>
              <Badge variant="secondary">
                Compression enabled for smaller output
              </Badge>
            </div>
            <Button 
              onClick={handleBase64Conversion} 
              disabled={isProcessing || files.length === 0}
              className="w-full"
            >
              Encode to Base64
            </Button>
          </TabsContent>
        </Tabs>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Conversion Results</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? 'Success' : 'Failed'}
                  </Badge>
                  <span className="text-sm">{result.message}</span>
                </div>
                {result.success && result.data && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownload(result)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}