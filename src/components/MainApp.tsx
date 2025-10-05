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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <ConversionNav onNavigate={handleNavigation} />
      <div className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
}



function HomeView() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="p-3 bg-primary rounded-lg text-primary-foreground">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            FileCraft Pro
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your all-in-one solution for file conversion, text processing, and data transformation.
          Fast, secure, and powerful tools for developers and creators.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={FileText}
          title="Text Processing"
          description="Encode, decode, and hash text with multiple algorithms"
          color="bg-blue-500"
          available={true}
        />
        <FeatureCard
          icon={ImageIcon}
          title="Image Conversion"
          description="Convert between JPEG, PNG, WebP, AVIF, and more"
          color="bg-green-500"
          available={true}
        />
        <FeatureCard
          icon={Video}
          title="Video Processing"
          description="Transform videos to MP4, WebM, AVI with quality control"
          color="bg-purple-500"
          available={true}
        />
        <FeatureCard
          icon={Music}
          title="Audio Conversion"
          description="Convert audio files to MP3, WAV, FLAC, and other formats"
          color="bg-orange-500"
          available={true}
        />
        <FeatureCard
          icon={Hash}
          title="Cryptographic Hashing"
          description="Generate secure hashes with MD5, SHA256, BLAKE2b"
          color="bg-red-500"
          available={true}
        />
        <FeatureCard
          icon={FileArchive}
          title="Smart Compression"
          description="Intelligent file compression with size optimization"
          color="bg-indigo-500"
          available={true}
        />
      </div>

      {/* Stats Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Why Choose FileCraft Pro?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Optimized processing algorithms for maximum speed
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your data is processed securely and never stored
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold">Always Available</h3>
              <p className="text-sm text-muted-foreground">
                24/7 availability with real-time processing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>
            Get started with FileCraft Pro in just a few clicks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</div>
                Choose Your Tool
              </h4>
              <p className="text-sm text-muted-foreground">
                Select from our dropdown menus to find the conversion tool you need
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</div>
                Input Your Data
              </h4>
              <p className="text-sm text-muted-foreground">
                Upload files or enter text directly into our secure interface
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">3</div>
                Process & Download
              </h4>
              <p className="text-sm text-muted-foreground">
                Click process and download your converted files instantly
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">4</div>
                Share & Enjoy
              </h4>
              <p className="text-sm text-muted-foreground">
                Use your converted files anywhere with full compatibility
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  available 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  color: string; 
  available: boolean;
}) {
  return (
    <Card className={`transition-all hover:shadow-lg ${!available ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${color} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
          <Badge variant={available ? "default" : "secondary"}>
            {available ? "Available" : "Coming Soon"}
          </Badge>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}