'use client';

import React, { useState } from 'react';
import { ConversionNav } from '@/components/ConversionNav';
import { TextProcessor } from '@/components/TextProcessor';
import { FileUpload } from '@/components/FileUpload';
import { ConversionPanel } from '@/components/ConversionPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image as ImageIcon,
  Video,
  Music,
  Code2,
  Hash,
  FileArchive,
  FileText,
  Home as HomeIcon,
  Sparkles,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

interface AppState {
  currentView: string;
  subType?: string;
}

// Helper function to get accepted file types for each conversion type
const getAcceptedFileTypes = (viewType: string): Record<string, string[]> => {
  switch (viewType) {
    case 'image':
      return {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.avif', '.heic', '.ico']
      };
    case 'video':
      return {
        'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.ogv', '.m4v', '.3gp']
      };
    case 'audio':
      return {
        'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.opus', '.webm', '.aiff', '.au']
      };
    case 'compress':
      return {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff'],
        'application/*': ['.pdf', '.zip', '.rar', '.7z'],
        'text/*': ['.txt', '.csv', '.json', '.xml']
      };
    default:
      return {
        '*/*': ['*']
      };
  }
};

export function MainApp() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'home'
  });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleNavigation = (type: string, subType?: string) => {
    setAppState({
      currentView: type,
      subType: subType
    });
  };

  const handleFilesChange = (files: any[]) => {
    setUploadedFiles(files);
  };

  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'text':
        return (
          <TextProcessor 
            operation={appState.subType || 'encode'} 
            format="base64"
          />
        );
      
      case 'encode':
        return (
          <TextProcessor 
            operation="encode" 
            format={appState.subType || 'base64'}
          />
        );
      
      case 'decode':
        return (
          <TextProcessor 
            operation="decode" 
            format={appState.subType || 'base64'}
          />
        );
      
      case 'hash':
        return (
          <TextProcessor 
            operation="hash" 
            format={appState.subType || 'sha256'}
          />
        );

      case 'image':
      case 'video':
      case 'audio':
      case 'compress':
        return (
          <div className="space-y-6">
            <FileUpload 
              onFilesChange={handleFilesChange}
              accept={getAcceptedFileTypes(appState.currentView)}
              maxFiles={appState.currentView === 'compress' ? 1 : 10}
            />
            {uploadedFiles.length > 0 && (
              <ConversionPanel 
                files={uploadedFiles}
                onConversionComplete={(result) => {
                  console.log('Conversion completed:', result);
                }}
              />
            )}
          </div>
        );
      
      case 'home':
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <ConversionNav onNavigate={handleNavigation} />
      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
}



function HomeView() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-16 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-center">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-3xl blur-lg opacity-60 animate-pulse"></div>
              <div className="relative p-6 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl text-primary-foreground shadow-2xl">
                <Sparkles className="w-16 h-16" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight animate-slide-up">
              FileCraft Pro
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
              Transform your files with <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-bold">lightning speed</span>
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-up" style={{animationDelay: '0.4s'}}>
              The ultimate toolkit for 
              <span className="text-primary font-semibold"> developers</span>, 
              <span className="text-green-600 font-semibold"> creators</span>, and 
              <span className="text-blue-600 font-semibold"> professionals</span>
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-slide-up" style={{animationDelay: '0.6s'}}>
          <Button 
            size="lg" 
            className="px-10 py-7 text-xl font-medium shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Sparkles className="w-6 h-6 mr-3" />
            Start Converting Now
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-10 py-7 text-xl font-medium border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
          >
            Explore Features
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 animate-slide-up" style={{animationDelay: '0.8s'}}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">1M+</div>
            <div className="text-muted-foreground">Files Converted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600">99.9%</div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600">24/7</div>
            <div className="text-muted-foreground">Support</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Powerful Tools at Your Fingertips</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for file conversion and data processing, all in one place.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={FileText}
            title="Text Processing"
            description="Encode, decode, and hash text with multiple algorithms including Base64, JWT, and cryptographic hashes"
            color="from-blue-500 to-blue-600"
            textColor="text-blue-600"
            available={true}
          />
          <FeatureCard
            icon={ImageIcon}
            title="Image Conversion"
            description="Convert between JPEG, PNG, WebP, AVIF, and more with quality control and batch processing"
            color="from-green-500 to-green-600"
            textColor="text-green-600"
            available={true}
          />
          <FeatureCard
            icon={Video}
            title="Video Processing"
            description="Transform videos to MP4, WebM, AVI with advanced quality control and format optimization"
            color="from-purple-500 to-purple-600"
            textColor="text-purple-600"
            available={true}
          />
          <FeatureCard
            icon={Music}
            title="Audio Conversion"
            description="Convert audio files to MP3, WAV, FLAC, and other formats with bitrate control"
            color="from-orange-500 to-orange-600"
            textColor="text-orange-600"
            available={true}
          />
          <FeatureCard
            icon={Hash}
            title="Cryptographic Hashing"
            description="Generate secure hashes with MD5, SHA256, BLAKE2b for data integrity verification"
            color="from-red-500 to-red-600"
            textColor="text-red-600"
            available={true}
          />
          <FeatureCard
            icon={FileArchive}
            title="Smart Compression"
            description="Intelligent file compression with size optimization and format-specific algorithms"
            color="from-indigo-500 to-indigo-600"
            textColor="text-indigo-600"
            available={true}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl"></div>
        <Card className="relative border-0 shadow-xl bg-background/80 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold">Why Choose FileCraft Pro?</CardTitle>
            <CardDescription className="text-lg">
              Built for performance, security, and reliability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl text-white shadow-lg">
                    <Zap className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Optimized processing algorithms deliver results in seconds, not minutes
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl text-white shadow-lg">
                    <Shield className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is processed securely with enterprise-grade encryption and never stored
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl text-white shadow-lg">
                    <Clock className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Always Available</h3>
                <p className="text-muted-foreground leading-relaxed">
                  24/7 availability with 99.9% uptime and real-time processing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold">Get Started in Minutes</CardTitle>
          <CardDescription className="text-lg">
            Transform your files in just four simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold flex items-center justify-center shadow-lg">
                    1
                  </div>
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h4 className="text-lg font-semibold">Choose Your Tool</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select from our intuitive dropdown menus to find the perfect conversion tool for your needs
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-xl font-bold flex items-center justify-center shadow-lg">
                    2
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-semibold">Input Your Data</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload files or paste text directly into our secure, user-friendly interface
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold flex items-center justify-center shadow-lg">
                    3
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-semibold">Process & Convert</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Watch as our advanced algorithms process your files with lightning speed and precision
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xl font-bold flex items-center justify-center shadow-lg">
                    4
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-semibold">Download & Share</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get your converted files instantly with full compatibility across all platforms
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-24 pt-16 pb-8 border-t bg-gradient-to-r from-muted/20 to-muted/10">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-lg text-primary-foreground">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              FileCraft Pro
            </span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with ❤️ for creators, developers, and professionals who demand the best in file processing.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <span>© 2024 FileCraft Pro</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  textColor,
  available 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  color: string; 
  textColor?: string;
  available: boolean;
}) {
  return (
    <Card className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-md ${!available ? 'opacity-75' : ''}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className={`relative p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
            <Icon className="w-7 h-7" />
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <Badge 
            variant={available ? "default" : "secondary"}
            className={available ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
          >
            {available ? "Available" : "Coming Soon"}
          </Badge>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}