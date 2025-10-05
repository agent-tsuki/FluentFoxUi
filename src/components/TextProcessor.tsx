'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Copy, 
  FileText, 
  Loader2, 
  Hash as HashIcon,
  Code2,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  encodeTextToBase64, 
  decodeBase64Text, 
  encodeTextToHex, 
  decodeHexText,
  encodeTextToUrl,
  decodeUrlText,
  hashText,
  ConversionResponse
} from '@/lib/api';

interface TextProcessorProps {
  operation: string;
  format?: string;
}

type OperationType = 'encode' | 'decode' | 'hash';

interface FormatConfig {
  label: string;
  desc: string;
}

interface OperationConfig {
  title: string;
  description: string;
  icon: typeof Code2;
  color: string;
  formats: Record<string, FormatConfig>;
}

export function TextProcessor({ operation, format }: TextProcessorProps) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const operations: Record<OperationType, OperationConfig> = {
    encode: {
      title: 'Text Encoding',
      description: 'Encode text to various formats',
      icon: Code2,
      color: 'bg-blue-500',
      formats: {
        base64: { label: 'Base64', desc: 'Text-safe encoding' },
        hex: { label: 'Hexadecimal', desc: 'Binary to hex' },
        url: { label: 'URL Encoding', desc: 'Web-safe URLs' },
      }
    },
    decode: {
      title: 'Text Decoding',
      description: 'Decode text from various formats',
      icon: Code2,
      color: 'bg-green-500',
      formats: {
        base64: { label: 'Base64', desc: 'From Base64 encoding' },
        hex: { label: 'Hexadecimal', desc: 'From hex encoding' },
        url: { label: 'URL Decoding', desc: 'From URL encoding' },
      }
    },
    hash: {
      title: 'Text Hashing',
      description: 'Generate cryptographic hashes',
      icon: HashIcon,
      color: 'bg-purple-500',
      formats: {
        md5: { label: 'MD5', desc: 'Fast checksum' },
        sha1: { label: 'SHA1', desc: 'Git standard' },
        sha256: { label: 'SHA256', desc: 'Secure standard' },
        sha512: { label: 'SHA512', desc: 'Maximum security' },
        blake2b: { label: 'BLAKE2b', desc: 'Modern fast hash' },
      }
    }
  };

  const currentOp = operations[operation as OperationType];
  const [selectedFormat, setSelectedFormat] = useState<string>(
    format || Object.keys(currentOp?.formats || {})[0] || ''
  );

  const processText = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    try {
      let response: ConversionResponse;

      switch (operation) {
        case 'encode':
          switch (selectedFormat) {
            case 'base64':
              response = await encodeTextToBase64(inputText);
              break;
            case 'hex':
              response = await encodeTextToHex(inputText);
              break;
            case 'url':
              response = await encodeTextToUrl(inputText);
              break;
            default:
              throw new Error('Invalid encoding format');
          }
          break;

        case 'decode':
          switch (selectedFormat) {
            case 'base64':
              response = await decodeBase64Text(inputText);
              break;
            case 'hex':
              response = await decodeHexText(inputText);
              break;
            case 'url':
              response = await decodeUrlText(inputText);
              break;
            default:
              throw new Error('Invalid decoding format');
          }
          break;

        case 'hash':
          response = await hashText(inputText, { algorithm: selectedFormat });
          break;

        default:
          throw new Error('Invalid operation');
      }

      // Extract the actual result from the response
      let result = '';
      if (response.data?.content) {
        // The API processing functions return the result in the content field
        result = response.data.content;
      } else if (response.data?.base64) {
        // Fallback for file operations that return base64
        result = atob(response.data.base64);
      } else {
        // If no structured response, use the raw response
        result = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
      }

      setOutputText(result);
      toast.success(`Text ${operation}d successfully!`);
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(`Failed to ${operation} text. Please check your input.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  const swapTexts = () => {
    if (operation === 'hash') return; // Can't swap for hashing
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
  };

  if (!currentOp) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Invalid text operation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const Icon = currentOp.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${currentOp.color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentOp.title}
                  <Badge variant="secondary" className="text-xs">
                    {currentOp.formats[selectedFormat]?.label}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentOp.description} - {currentOp.formats[selectedFormat]?.desc}
                </CardDescription>
              </div>
            </div>
            
            {/* Format Selector */}
            <div className="flex items-center space-x-2">
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currentOp.formats).map(([key, format]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span className="font-medium">{format.label}</span>
                        <span className="text-xs text-muted-foreground">{format.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Text Processing Interface */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Input Text
            </CardTitle>
            <CardDescription>
              Enter the text you want to {operation}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={`Enter text to ${operation}...`}
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
              className="min-h-64 resize-y font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {inputText.length.toLocaleString()} characters
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={!inputText && !outputText}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                {operation !== 'hash' && outputText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={swapTexts}
                    disabled={isProcessing}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Swap
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon className="w-5 h-5" />
              Output {operation === 'hash' ? 'Hash' : 'Text'}
            </CardTitle>
            <CardDescription>
              {operation === 'hash' 
                ? `${currentOp.formats[selectedFormat]?.label} hash result`
                : `${currentOp.formats[selectedFormat]?.label} ${operation}d text`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={`${operation === 'hash' ? 'Hash' : 'Processed text'} will appear here...`}
              value={outputText}
              readOnly
              className="min-h-64 resize-y font-mono text-sm bg-muted/30"
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {outputText ? `${outputText.length.toLocaleString()} characters` : 'No output yet'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(outputText)}
                  disabled={!outputText}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Button
              onClick={processText}
              disabled={isProcessing || !inputText.trim()}
              size="lg"
              className="min-w-48"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon className="w-5 h-5 mr-2" />
                  {operation === 'hash' ? 'Generate Hash' : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Text`}
                </>
              )}
            </Button>
          </div>
          
          {/* Tips */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Tips:</p>
                <ul className="space-y-1 text-xs">
                  {operation === 'encode' && (
                    <>
                      <li>• Base64 is great for embedding data in text formats</li>
                      <li>• Hex encoding shows binary data as hexadecimal digits</li>
                      <li>• URL encoding makes text safe for web URLs</li>
                    </>
                  )}
                  {operation === 'decode' && (
                    <>
                      <li>• Make sure your input is properly formatted for the selected format</li>
                      <li>• Invalid encoded data will result in an error</li>
                      <li>• Use the swap button to quickly reverse operations</li>
                    </>
                  )}
                  {operation === 'hash' && (
                    <>
                      <li>• Hashing is one-way - you cannot reverse the process</li>
                      <li>• SHA256 is recommended for most security applications</li>
                      <li>• BLAKE2b offers excellent performance and security</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}