'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ConversionPanel } from '@/components/ConversionPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Upload, 
  Download, 
  Shield, 
  Gauge, 
  Sparkles,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  ArrowRight,
  Github,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [activeView, setActiveView] = useState<'landing' | 'app'>('landing');

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "High-performance file processing with stream-based architecture"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Safe",
      description: "Enterprise-grade security with input validation and sanitization"
    },
    {
      icon: <Gauge className="w-6 h-6" />,
      title: "No File Limits",
      description: "Process files of any size with intelligent compression"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "20+ Formats",
      description: "Support for images, videos, audio, and document formats"
    }
  ];

  const supportedFormats = [
    {
      category: "Images",
      icon: <FileImage className="w-5 h-5" />,
      formats: ["JPEG", "PNG", "WebP", "AVIF", "HEIC", "RAW", "BMP", "GIF", "TIFF"],
      color: "text-blue-600"
    },
    {
      category: "Videos",
      icon: <FileVideo className="w-5 h-5" />,
      formats: ["MP4", "AVI", "MOV", "MKV", "WebM", "FLV", "WMV"],
      color: "text-green-600"
    },
    {
      category: "Audio",
      icon: <FileAudio className="w-5 h-5" />,
      formats: ["MP3", "WAV", "FLAC", "OGG", "M4A", "AAC"],
      color: "text-purple-600"
    },
    {
      category: "Archives",
      icon: <FileArchive className="w-5 h-5" />,
      formats: ["ZIP", "RAR", "7Z", "TAR", "PDF", "Base64"],
      color: "text-orange-600"
    }
  ];

  if (activeView === 'app') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">FileCraft</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">v2.0</Badge>
              <Button variant="ghost" size="sm" onClick={() => setActiveView('landing')}>
                ← Back to Landing
              </Button>
            </div>
          </div>
        </header>

        {/* Main App */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* File Upload */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">File Processing Studio</h1>
                <p className="text-muted-foreground">
                  Upload your files and convert them to any format you need
                </p>
              </div>
              
              <FileUpload 
                onFilesChange={setFiles}
                maxFiles={10}
                maxSize={100 * 1024 * 1024} // 100MB
              />
            </div>

            {/* Conversion Panel */}
            <div>
              <ConversionPanel 
                files={files} 
                onConversionComplete={(result) => {
                  // Handle individual file completion if needed
                  // Toast messages are handled by ConversionPanel itself
                  console.log('File conversion completed:', result.message);
                }}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">FileCraft</span>
            <Badge variant="secondary" className="ml-2">Pro</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button onClick={() => setActiveView('app')} className="gap-2">
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex justify-center mb-6">
              <Badge variant="outline" className="gap-2">
                <Star className="w-3 h-3 fill-current" />
                Professional Media Processing API
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Transform Any File
              <span className="text-primary block">Instantly & Securely</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade file processing with support for 20+ formats. 
              Convert, compress, and optimize your media files with enterprise security.
            </p>
            
            <div className="flex gap-4 justify-center mt-8">
              <Button 
                size="lg" 
                onClick={() => setActiveView('app')}
                className="gap-2 text-lg px-8"
              >
                <Upload className="w-5 h-5" />
                Start Converting
              </Button>
              <Button variant="outline" size="lg" className="gap-2 text-lg px-8">
                <Download className="w-5 h-5" />
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose FileCraft?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern architecture and enterprise-grade features for professionals who demand the best.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Supported File Formats</h2>
            <p className="text-muted-foreground">
              Comprehensive support for all major file types and formats
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportedFormats.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className={`w-12 h-12 mx-auto rounded-lg bg-muted flex items-center justify-center ${category.color} mb-4`}>
                      {category.icon}
                    </div>
                    <CardTitle>{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {category.formats.map((format) => (
                        <Badge key={format} variant="secondary" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold">Ready to Transform Your Files?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals who trust FileCraft for their file processing needs.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setActiveView('app')}
              className="gap-2 text-lg px-8"
            >
              <Zap className="w-5 h-5" />
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">FileCraft</span>
              <span className="text-muted-foreground">Professional Media Processing</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Built with Next.js & FastAPI</span>
              <span>•</span>
              <span>Enterprise Security</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}