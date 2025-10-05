'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface ConversionNavProps {
  onNavigate: (type: string, subType?: string) => void;
}

export function ConversionNav({ onNavigate }: ConversionNavProps) {
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => handleNavigate('home')} 
              variant="ghost"
              className="flex items-center space-x-2 text-xl font-bold p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <div className="p-1 bg-gradient-to-br from-primary to-primary/70 rounded-md text-primary-foreground">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                FileCraft
              </span>
            </Button>
            <Badge variant="outline" className="text-xs font-medium">Pro</Badge>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            {isClient ? (
              <>
                {/* Image Conversion Button Group */}
                <div className="relative group">
                  <Button 
                    variant="outline"
                    className="h-10 px-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Images
                  </Button>
                  
                  {/* Hover dropdown for images */}
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-green-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-green-700 px-3 py-2 border-b border-green-100">Convert Images To:</div>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {imageFormats.map((format) => (
                          <button
                            key={format.value}
                            onClick={() => handleNavigate('image', format.value)}
                            className="p-3 text-left hover:bg-green-50 rounded-lg transition-colors group/item"
                          >
                            <div className="text-sm font-medium text-gray-900 group-hover/item:text-green-700">
                              {format.label}
                            </div>
                            <div className="text-xs text-gray-500 group-hover/item:text-green-600">
                              {format.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Conversion Button Group */}
                <div className="relative group">
                  <Button 
                    variant="outline"
                    className="h-10 px-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Videos
                  </Button>
                  
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-purple-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-purple-700 px-3 py-2 border-b border-purple-100">Convert Videos To:</div>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {videoFormats.map((format) => (
                          <button
                            key={format.value}
                            onClick={() => handleNavigate('video', format.value)}
                            className="p-3 text-left hover:bg-purple-50 rounded-lg transition-colors group/item"
                          >
                            <div className="text-sm font-medium text-gray-900 group-hover/item:text-purple-700">
                              {format.label}
                            </div>
                            <div className="text-xs text-gray-500 group-hover/item:text-purple-600">
                              {format.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio Conversion Button Group */}
                <div className="relative group">
                  <Button 
                    variant="outline"
                    className="h-10 px-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 hover:border-orange-300 text-orange-700 hover:text-orange-800 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Audio
                  </Button>
                  
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-orange-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-orange-700 px-3 py-2 border-b border-orange-100">Convert Audio To:</div>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {audioFormats.map((format) => (
                          <button
                            key={format.value}
                            onClick={() => handleNavigate('audio', format.value)}
                            className="p-3 text-left hover:bg-orange-50 rounded-lg transition-colors group/item"
                          >
                            <div className="text-sm font-medium text-gray-900 group-hover/item:text-orange-700">
                              {format.label}
                            </div>
                            <div className="text-xs text-gray-500 group-hover/item:text-orange-600">
                              {format.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Encoding Button Group */}
                <div className="relative group">
                  <Button 
                    variant="outline"
                    className="h-10 px-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Text Tools
                  </Button>
                  
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-blue-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-2">
                      <div className="space-y-3">
                        {/* Encoding Section */}
                        <div>
                          <div className="text-xs font-semibold text-blue-700 px-3 py-2 border-b border-blue-100">Encode Text:</div>
                          <div className="grid grid-cols-2 gap-1 mt-2">
                            {encodingFormats.map((format) => (
                              <button
                                key={`encode-${format.value}`}
                                onClick={() => handleNavigate('encode', format.value)}
                                className="p-3 text-left hover:bg-blue-50 rounded-lg transition-colors group/item"
                              >
                                <div className="text-sm font-medium text-gray-900 group-hover/item:text-blue-700">
                                  {format.label}
                                </div>
                                <div className="text-xs text-gray-500 group-hover/item:text-blue-600">
                                  {format.desc}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Decoding Section */}
                        <div>
                          <div className="text-xs font-semibold text-cyan-700 px-3 py-2 border-b border-cyan-100">Decode Text:</div>
                          <div className="grid grid-cols-2 gap-1 mt-2">
                            {encodingFormats.map((format) => (
                              <button
                                key={`decode-${format.value}`}
                                onClick={() => handleNavigate('decode', format.value)}
                                className="p-3 text-left hover:bg-cyan-50 rounded-lg transition-colors group/item"
                              >
                                <div className="text-sm font-medium text-gray-900 group-hover/item:text-cyan-700">
                                  Decode {format.label}
                                </div>
                                <div className="text-xs text-gray-500 group-hover/item:text-cyan-600">
                                  {format.desc}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Hash Section */}
                        <div>
                          <div className="text-xs font-semibold text-red-700 px-3 py-2 border-b border-red-100">Generate Hash:</div>
                          <div className="grid grid-cols-2 gap-1 mt-2">
                            {hashAlgorithms.map((hash) => (
                              <button
                                key={`hash-${hash.value}`}
                                onClick={() => handleNavigate('hash', hash.value)}
                                className="p-3 text-left hover:bg-red-50 rounded-lg transition-colors group/item"
                              >
                                <div className="text-sm font-medium text-gray-900 group-hover/item:text-red-700">
                                  {hash.label}
                                </div>
                                <div className="text-xs text-gray-500 group-hover/item:text-red-600">
                                  {hash.desc}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compression Button */}
                <Button 
                  onClick={() => handleNavigate('compress')} 
                  variant="outline"
                  className="h-10 px-4 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 border-teal-200 hover:border-teal-300 text-teal-700 hover:text-teal-800 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FileArchive className="w-4 h-4 mr-2" />
                  Compress
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-24 h-10 bg-muted animate-pulse rounded-md"></div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur-md">
            <div className="container py-6 space-y-6">
              
              {/* Images Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-green-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Convert Images
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {imageFormats.map((format) => (
                    <Button
                      key={format.value}
                      onClick={() => handleNavigate('image', format.value)}
                      variant="outline"
                      className="h-14 p-3 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 justify-start"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium">{format.label}</div>
                        <div className="text-xs text-green-600">{format.desc}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Videos Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-purple-700 flex items-center">
                  <Video className="w-4 h-4 mr-2" />
                  Convert Videos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {videoFormats.map((format) => (
                    <Button
                      key={format.value}
                      onClick={() => handleNavigate('video', format.value)}
                      variant="outline"
                      className="h-14 p-3 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 justify-start"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium">{format.label}</div>
                        <div className="text-xs text-purple-600">{format.desc}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Audio Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-orange-700 flex items-center">
                  <Music className="w-4 h-4 mr-2" />
                  Convert Audio
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {audioFormats.map((format) => (
                    <Button
                      key={format.value}
                      onClick={() => handleNavigate('audio', format.value)}
                      variant="outline"
                      className="h-14 p-3 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 justify-start"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium">{format.label}</div>
                        <div className="text-xs text-orange-600">{format.desc}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Text Tools Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-700 flex items-center">
                  <Code2 className="w-4 h-4 mr-2" />
                  Text Tools
                </h3>
                
                {/* Encoding */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-blue-600">Encode:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {encodingFormats.map((format) => (
                      <Button
                        key={`mobile-encode-${format.value}`}
                        onClick={() => handleNavigate('encode', format.value)}
                        variant="outline"
                        className="h-12 p-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 justify-start"
                      >
                        <div className="text-left">
                          <div className="text-sm font-medium">{format.label}</div>
                          <div className="text-xs text-blue-600">{format.desc}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Decoding */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-cyan-600">Decode:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {encodingFormats.map((format) => (
                      <Button
                        key={`mobile-decode-${format.value}`}
                        onClick={() => handleNavigate('decode', format.value)}
                        variant="outline"
                        className="h-12 p-2 bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-700 justify-start"
                      >
                        <div className="text-left">
                          <div className="text-sm font-medium">Decode {format.label}</div>
                          <div className="text-xs text-cyan-600">{format.desc}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Hashing */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-red-600">Hash:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {hashAlgorithms.map((hash) => (
                      <Button
                        key={`mobile-hash-${hash.value}`}
                        onClick={() => handleNavigate('hash', hash.value)}
                        variant="outline"
                        className="h-12 p-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 justify-start"
                      >
                        <div className="text-left">
                          <div className="text-sm font-medium">{hash.label}</div>
                          <div className="text-xs text-red-600">{hash.desc}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compression */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-teal-700 flex items-center">
                  <FileArchive className="w-4 h-4 mr-2" />
                  File Compression
                </h3>
                <Button 
                  onClick={() => handleNavigate('compress')} 
                  variant="outline"
                  className="w-full h-14 bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700"
                >
                  <div className="flex items-center">
                    <FileArchive className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Smart Compression</div>
                      <div className="text-xs text-teal-600">Optimize file sizes</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}