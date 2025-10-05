'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  Code2, 
  Hash, 
  FileArchive, 
  FileText,
  Home
} from 'lucide-react';

interface ConversionNavProps {
  onNavigate: (type: string, subType?: string) => void;
}

export function ConversionNav({ onNavigate }: ConversionNavProps) {
  const imageFormats = [
    { value: 'jpeg', label: 'To JPEG', desc: 'High quality photos' },
    { value: 'png', label: 'To PNG', desc: 'Lossless with transparency' },
    { value: 'webp', label: 'To WebP', desc: 'Modern web format' },
    { value: 'avif', label: 'To AVIF', desc: 'Next-gen compression' },
    { value: 'bmp', label: 'To BMP', desc: 'Windows bitmap' },
    { value: 'tiff', label: 'To TIFF', desc: 'Professional print' },
  ];

  const videoFormats = [
    { value: 'mp4', label: 'To MP4', desc: 'Universal compatibility' },
    { value: 'webm', label: 'To WebM', desc: 'Web optimized' },
    { value: 'avi', label: 'To AVI', desc: 'Legacy support' },
    { value: 'mov', label: 'To MOV', desc: 'Apple QuickTime' },
    { value: 'mkv', label: 'To MKV', desc: 'High quality container' },
    { value: 'wmv', label: 'To WMV', desc: 'Windows Media' },
  ];

  const audioFormats = [
    { value: 'mp3', label: 'To MP3', desc: 'Universal audio' },
    { value: 'wav', label: 'To WAV', desc: 'Lossless quality' },
    { value: 'flac', label: 'To FLAC', desc: 'Audiophile quality' },
    { value: 'aac', label: 'To AAC', desc: 'Apple standard' },
    { value: 'ogg', label: 'To OGG', desc: 'Open source' },
    { value: 'm4a', label: 'To M4A', desc: 'iTunes compatible' },
  ];

  const encodingFormats = [
    { value: 'base64', label: 'Base64', desc: 'Text-safe encoding' },
    { value: 'hex', label: 'Hexadecimal', desc: 'Binary to hex' },
    { value: 'url', label: 'URL Encoding', desc: 'Web-safe URLs' },
    { value: 'jwt', label: 'JWT Tokens', desc: 'JSON Web Tokens' },
  ];

  const hashAlgorithms = [
    { value: 'md5', label: 'MD5', desc: 'Fast checksum' },
    { value: 'sha1', label: 'SHA1', desc: 'Git standard' },
    { value: 'sha256', label: 'SHA256', desc: 'Secure standard' },
    { value: 'sha512', label: 'SHA512', desc: 'Maximum security' },
    { value: 'blake2b', label: 'BLAKE2b', desc: 'Modern fast hash' },
  ];

  const textOperations = [
    { value: 'encode', label: 'Text Encoding', desc: 'Encode text to formats' },
    { value: 'decode', label: 'Text Decoding', desc: 'Decode text from formats' },
    { value: 'hash', label: 'Text Hashing', desc: 'Generate text hashes' },
    { value: 'transform', label: 'Text Transform', desc: 'Format conversions' },
  ];

  const handleNavigate = (type: string, subType?: string) => {
    onNavigate(type, subType);
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => handleNavigate('home')} 
            variant="ghost"
            className="text-xl font-bold p-0 hover:bg-transparent"
          >
            <Home className="w-5 h-5 mr-2" />
            FileCraft
          </Button>
          <Badge variant="secondary">Pro</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Image Conversion Dropdown */}
          <div className="relative">
            <Select onValueChange={(value: string) => handleNavigate('image', value)}>
              <SelectTrigger className="w-32">
                <ImageIcon className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Images" />
              </SelectTrigger>
              <SelectContent>
                {imageFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{format.label}</span>
                      <span className="text-xs text-muted-foreground">{format.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Video Conversion Dropdown */}
          <div className="relative">
            <Select onValueChange={(value: string) => handleNavigate('video', value)}>
              <SelectTrigger className="w-32">
                <Video className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Videos" />
              </SelectTrigger>
              <SelectContent>
                {videoFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{format.label}</span>
                      <span className="text-xs text-muted-foreground">{format.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audio Conversion Dropdown */}
          <div className="relative">
            <Select onValueChange={(value: string) => handleNavigate('audio', value)}>
              <SelectTrigger className="w-32">
                <Music className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Audio" />
              </SelectTrigger>
              <SelectContent>
                {audioFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{format.label}</span>
                      <span className="text-xs text-muted-foreground">{format.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Encoding Dropdown */}
          <div className="relative">
            <Select onValueChange={(value: string) => handleNavigate('encode', value)}>
              <SelectTrigger className="w-32">
                <Code2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Encode" />
              </SelectTrigger>
              <SelectContent>
                {encodingFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{format.label}</span>
                      <span className="text-xs text-muted-foreground">{format.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Decoding Dropdown */}
          <div className="relative">
            <Select onValueChange={(value: string) => handleNavigate('decode', value)}>
              <SelectTrigger className="w-32">
                <Code2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Decode" />
              </SelectTrigger>
              <SelectContent>
                {encodingFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Decode {format.label}</span>
                      <span className="text-xs text-muted-foreground">{format.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hash Dropdown */}
          <div className="relative">
            <Select onValueChange={(value: string) => handleNavigate('hash', value)}>
              <SelectTrigger className="w-32">
                <Hash className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Hash" />
              </SelectTrigger>
              <SelectContent>
                {hashAlgorithms.map((hash) => (
                  <SelectItem key={hash.value} value={hash.value}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{hash.label}</span>
                      <span className="text-xs text-muted-foreground">{hash.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Operations Dropdown */}
          <div className="relative">
            <Select onValueChange={(value: string) => handleNavigate('text', value)}>
              <SelectTrigger className="w-32">
                <FileText className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Text" />
              </SelectTrigger>
              <SelectContent>
                {textOperations.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{op.label}</span>
                      <span className="text-xs text-muted-foreground">{op.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compression Button */}
          <Button 
            onClick={() => handleNavigate('compress')} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileArchive className="w-4 h-4" />
            Compress
          </Button>
        </div>
      </div>
    </div>
  );
}