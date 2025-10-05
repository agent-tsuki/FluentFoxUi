/**
 * API utilities for FileCraft backend integration
 */

import axios, { AxiosResponse, AxiosProgressEvent } from 'axios';

// Base API configuration with environment-specific defaults
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-api-url.com' 
    : 'http://localhost:8080');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: process.env.NODE_ENV === 'production' ? 60000 : 300000, // 1 min prod, 5 min dev
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disable credentials to avoid CORS issues
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });
    return config;
  },
  (error: unknown) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: typeof response.data === 'object' ? 'object' : response.data?.toString()?.slice(0, 100),
    });
    return response;
  },
  (error: unknown) => {
    const axiosError = error as { 
      message?: string; 
      code?: string; 
      response?: { status?: number; data?: any }; 
      config?: { url?: string; baseURL?: string } 
    };
    console.error('❌ Response Error:', {
      message: axiosError.message,
      code: axiosError.code,
      status: axiosError.response?.status,
      url: axiosError.config?.url,
      fullURL: `${axiosError.config?.baseURL}${axiosError.config?.url}`,
      data: axiosError.response?.data,
    });
    return Promise.reject(error);
  }
);

// Types for API responses
export interface ConversionResponse {
  success: boolean;
  message: string;
  data?: {
    base64?: string;
    filename?: string;
    size?: number;
    format?: string;
    content?: string;
    result?: any;
  };
  task_id?: string;
}

export interface ProcessingStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: unknown;
  error?: string;
}

// API endpoints
export const apiEndpoints = {
  // Base64 operations
  encodeFileToBase64: '/api/v1/encode/base64/file',
  encodeTextToBase64: '/api/v1/encode/base64/text',
  decodeBase64File: '/api/v1/decode/base64/file',
  decodeBase64Text: '/api/v1/decode/base64/text',
  
  // Hex operations
  encodeTextToHex: '/api/v1/encode/hex/text',
  encodeFileToHex: '/api/v1/encode/hex/file',
  decodeHexText: '/api/v1/decode/hex/text',
  decodeHexFile: '/api/v1/decode/hex/file',
  
  // URL operations
  encodeTextToUrl: '/api/v1/encode/url/text',
  encodeFileToUrl: '/api/v1/encode/url/file',
  decodeUrlText: '/api/v1/decode/url/text',
  decodeUrlFile: '/api/v1/decode/url/file',
  
  // JWT operations
  encodeTextToJwt: '/api/v1/encode/jwt/text',
  encodeFileToJwt: '/api/v1/encode/jwt/file',
  decodeJwtToken: '/api/v1/decode/jwt/token',
  decodeJwtFile: '/api/v1/decode/jwt/file',
  
  // Hash operations
  hashText: '/api/v1/encode/hash/text',
  hashFile: '/api/v1/encode/hash/file',
  
  // Image processing
  convertImage: '/api/v1/images/convert',
  optimizeImage: '/api/v1/images/optimize',
  batchConvertImages: '/api/v1/images/batch-convert',
  getImageInfo: '/api/v1/images/info',
  
  // Video processing
  convertVideo: '/api/v1/video/convert',
  batchConvertVideos: '/api/v1/video/batch-convert',
  extractAudio: '/api/v1/video/extract-audio',
  generateThumbnail: '/api/v1/video/thumbnail',
  getVideoInfo: '/api/v1/video/info',
  
  // Audio processing
  convertAudio: '/api/v1/audio/convert',
  batchConvertAudio: '/api/v1/audio/batch-convert',
  applyAudioEffects: '/api/v1/audio/effects',
  analyzeAudio: '/api/v1/audio/analyze',
  optimizeAudio: '/api/v1/audio/optimize',
  extractSegments: '/api/v1/audio/extract-segments',
  
  // Compression
  compressFile: '/api/v1/compression/smart-compress',
  
  // System
  healthCheck: '/health',
  systemInfo: '/api/info',
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper function to extract filename from content-disposition header
const extractFilename = (contentDisposition: string, originalFilename: string): string => {
  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
  return filenameMatch ? filenameMatch[1] : `converted_${originalFilename}`;
};

// File upload with progress tracking
export const uploadFileForProcessing = async (
  endpoint: string,
  file: File,
  queryParams?: Record<string, unknown>,
  onProgress?: (progress: number) => void
): Promise<ConversionResponse> => {
  const formData = new FormData();
  
  // Handle different file field names based on endpoint
  let fileFieldName = 'file';
  if (endpoint.includes('/images/')) fileFieldName = 'image';
  else if (endpoint.includes('/video/')) fileFieldName = 'video';
  else if (endpoint.includes('/audio/')) fileFieldName = 'audio';
  
  formData.append(fileFieldName, file);
  
  // For conversion endpoints, target_format goes in form data
  if (queryParams?.target_format && (endpoint.includes('/convert') || endpoint.includes('/batch-convert'))) {
    formData.append('target_format', String(queryParams.target_format));
    // Remove from query params since it's in form data
    const { target_format, ...remainingParams } = queryParams;
    queryParams = remainingParams;
  }

  try {
    // Build URL with query parameters
    let url = endpoint;
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      if (params.toString()) {
        url += '?' + params.toString();
      }
    }

    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob', // Most conversion endpoints return files as blobs
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    
    // Check if response is JSON (error case) or blob (success case)
    const contentType = response.headers['content-type'];
    
    if (contentType?.includes('application/json')) {
      // This is likely an error response
      const text = await (response.data as Blob).text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || 'Processing failed');
    }
    
    // Convert blob response to base64 for frontend usage
    const resultBlob = response.data as Blob;
    const base64Result = await blobToBase64(resultBlob);
    
    // Extract filename from response headers if available
    const contentDisposition = response.headers['content-disposition'] || '';
    const filename = extractFilename(contentDisposition, file.name);
    
    return {
      success: true,
      message: 'File processed successfully',
      data: {
        base64: base64Result,
        filename: filename,
        size: resultBlob.size,
        format: resultBlob.type || 'application/octet-stream',
      }
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Handle axios errors
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData?.detail) {
        throw new Error(Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail);
      }
    }
    
    throw error;
  }
};

// Text-based processing helper
const processTextInput = async (
  endpoint: string,
  text: string,
  queryParams?: Record<string, unknown>
): Promise<ConversionResponse> => {
  const params = new URLSearchParams();
  params.append('text', text);
  
  let url = endpoint;
  if (queryParams) {
    const urlParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(key, String(value));
      }
    });
    if (urlParams.toString()) {
      url += '?' + urlParams.toString();
    }
  }

  try {
    const response = await api.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const resultData = response.data;
    
    // Extract the appropriate field based on the response structure
    let content = '';
    if (resultData.encoded) {
      content = resultData.encoded;
    } else if (resultData.decoded) {
      content = resultData.decoded;
    } else if (resultData.hash) {
      content = resultData.hash;
    } else if (resultData.token) {
      content = resultData.token;
    } else if (resultData.result) {
      content = resultData.result;
    } else if (typeof resultData === 'string') {
      content = resultData;
    } else {
      // If we can't find the expected field, return the whole response as JSON
      content = JSON.stringify(resultData, null, 2);
    }
    
    return {
      success: true,
      message: 'Text processed successfully',
      data: {
        content: content,
        filename: 'processed_text.txt',
        format: 'text/plain',
      }
    };
  } catch (error: any) {
    console.error('Text processing error:', error);
    throw error;
  }
};

// Image conversion
export const convertImage = async (
  file: File,
  options: {
    format: string;
    quality?: number;
    width?: number;
    height?: number;
    optimization_level?: string;
    maintain_aspect_ratio?: boolean;
    use_async?: boolean;
  },
  onProgress?: (progress: number) => void
): Promise<ConversionResponse> => {
  const queryParams: Record<string, unknown> = {
    target_format: options.format, // This will be moved to form data by uploadFileForProcessing
  };
  
  if (options.quality !== undefined) queryParams.quality = options.quality;
  if (options.width !== undefined) queryParams.resize_width = options.width;
  if (options.height !== undefined) queryParams.resize_height = options.height;
  if (options.optimization_level) queryParams.optimization_level = options.optimization_level;
  if (options.maintain_aspect_ratio !== undefined) queryParams.maintain_aspect_ratio = options.maintain_aspect_ratio;
  if (options.use_async !== undefined) queryParams.use_async = options.use_async;
  
  return uploadFileForProcessing(
    apiEndpoints.convertImage,
    file,
    queryParams,
    onProgress
  );
};

// Video conversion
export const convertVideo = async (
  file: File,
  options: {
    format: string;
    quality?: string;
    codec?: string;
    bitrate?: string;
    width?: number;
    height?: number;
    frame_rate?: number;
  },
  onProgress?: (progress: number) => void
): Promise<ConversionResponse> => {
  const queryParams: Record<string, unknown> = {
    target_format: options.format, // This will be moved to form data by uploadFileForProcessing
  };
  
  if (options.quality) queryParams.quality_preset = options.quality;
  if (options.codec) queryParams.codec = options.codec;
  if (options.bitrate) queryParams.bitrate = options.bitrate;
  if (options.width !== undefined) queryParams.width = options.width;
  if (options.height !== undefined) queryParams.height = options.height;
  if (options.frame_rate !== undefined) queryParams.frame_rate = options.frame_rate;
  
  return uploadFileForProcessing(
    apiEndpoints.convertVideo,
    file,
    queryParams,
    onProgress
  );
};

// Audio conversion
export const convertAudio = async (
  file: File,
  options: {
    format: string;
    bitrate?: string | number;
    sample_rate?: number;
    channels?: number;
    quality_preset?: string;
  },
  onProgress?: (progress: number) => void
): Promise<ConversionResponse> => {
  const queryParams: Record<string, unknown> = {
    target_format: options.format, // This will be moved to form data by uploadFileForProcessing
  };
  
  if (options.bitrate !== undefined) {
    // Convert bitrate string like "192k" to number
    const bitrateNum = typeof options.bitrate === 'string' 
      ? parseInt(options.bitrate.replace('k', ''))
      : options.bitrate;
    queryParams.bitrate = bitrateNum;
  }
  if (options.sample_rate !== undefined) queryParams.sample_rate = options.sample_rate;
  if (options.channels !== undefined) queryParams.channels = options.channels;
  if (options.quality_preset) queryParams.quality_preset = options.quality_preset;
  
  return uploadFileForProcessing(
    apiEndpoints.convertAudio,
    file,
    queryParams,
    onProgress
  );
};

// File compression
export const compressFile = async (
  file: File,
  options: {
    compression_level?: number;
    quality?: number;
    force_webp?: boolean;
  } = {},
  onProgress?: (progress: number) => void
): Promise<ConversionResponse> => {
  const queryParams: Record<string, unknown> = {};
  if (options.compression_level !== undefined) queryParams.compression_level = options.compression_level;
  if (options.quality !== undefined) queryParams.quality = options.quality;
  if (options.force_webp !== undefined) queryParams.force_webp = options.force_webp;
  
  return uploadFileForProcessing(
    apiEndpoints.compressFile,
    file,
    queryParams,
    onProgress
  );
};

// Base64 encoding - File
export const encodeFileToBase64 = async (
  file: File,
  options?: { url_safe?: boolean },
  onProgress?: (progress: number) => void
): Promise<ConversionResponse> => {
  const queryParams: Record<string, unknown> = {};
  if (options?.url_safe !== undefined) queryParams.url_safe = options.url_safe;
  
  return uploadFileForProcessing(
    apiEndpoints.encodeFileToBase64,
    file,
    queryParams,
    onProgress
  );
};

// Base64 encoding - Text
export const encodeTextToBase64 = async (
  text: string,
  options?: { url_safe?: boolean }
): Promise<ConversionResponse> => {
  const params = new URLSearchParams();
  params.append('text', text);
  
  let url = apiEndpoints.encodeTextToBase64;
  if (options?.url_safe !== undefined) {
    url += `?url_safe=${options.url_safe}`;
  }

  try {
    const response = await api.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return {
      success: true,
      message: 'Text encoded to Base64 successfully',
      data: {
        content: response.data.encoded || response.data,
        filename: 'encoded_base64.txt',
        format: 'text/plain',
      }
    };
  } catch (error: any) {
    console.error('Base64 encode error:', error);
    throw error;
  }
};

// Hex encoding - Text
export const encodeTextToHex = async (
  text: string,
  options?: { uppercase?: boolean; separator?: string; prefix?: string; encoding?: string }
): Promise<ConversionResponse> => {
  const params = new URLSearchParams();
  params.append('text', text);
  
  let url = apiEndpoints.encodeTextToHex;
  if (options) {
    const queryParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }
  }

  try {
    const response = await api.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return {
      success: true,
      message: 'Text encoded to Hex successfully',
      data: {
        content: response.data.encoded || response.data,
        filename: 'encoded_hex.txt',
        format: 'text/plain',
      }
    };
  } catch (error: any) {
    console.error('Hex encode error:', error);
    throw error;
  }
};

// Hex encoding - File
export const encodeFileToHex = async (
  file: File,
  options?: { uppercase?: boolean; separator?: string; prefix?: string }
): Promise<ConversionResponse> => {
  return uploadFileForProcessing(
    apiEndpoints.encodeFileToHex,
    file,
    options
  );
};

// URL encoding - Text
export const encodeTextToUrl = async (
  text: string,
  options?: { safe?: string; encoding?: string; plus_encoding?: boolean }
): Promise<ConversionResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('text', text);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await api.post(apiEndpoints.encodeTextToUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return {
      success: true,
      message: 'Text encoded to URL successfully',
      data: {
        content: response.data.encoded || response.data,
        filename: 'encoded_url.txt',
        format: 'text/plain',
      }
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to encode text to URL');
  }
};

// URL encoding - File
export const encodeFileToUrl = async (
  file: File,
  options?: { safe?: string; encoding?: string }
): Promise<ConversionResponse> => {
  return uploadFileForProcessing(
    apiEndpoints.encodeFileToUrl,
    file,
    options
  );
};

// JWT encoding - Text
export const encodeTextToJwt = async (
  text: string,
  secret: string = 'your-secret-key',
  options?: { algorithm?: string; exp_minutes?: number }
): Promise<ConversionResponse> => {
  const params = new URLSearchParams();
  params.append('text', text);
  params.append('secret', secret);
  
  let url = apiEndpoints.encodeTextToJwt;
  if (options) {
    const urlParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(key, String(value));
      }
    });
    if (urlParams.toString()) {
      url += '?' + urlParams.toString();
    }
  }

  try {
    const response = await api.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return {
      success: true,
      message: 'Text JWT encoded successfully',
      data: {
        content: response.data.token || response.data.result || response.data,
        filename: 'encoded_text.jwt',
        format: 'text/plain',
      }
    };
  } catch (error: any) {
    console.error('JWT encode error:', error);
    throw error;
  }
};

// JWT encoding - File
export const encodeFileToJwt = async (
  file: File,
  secret: string = 'your-secret-key',
  options?: { algorithm?: string; exp_minutes?: number }
): Promise<ConversionResponse> => {
  const queryParams: Record<string, unknown> = {
    secret: secret
  };
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = value;
      }
    });
  }

  return uploadFileForProcessing(
    apiEndpoints.encodeFileToJwt,
    file,
    queryParams
  );
};

// Hash text
export const hashText = async (
  text: string,
  options?: { algorithm?: string; output_format?: string; salt?: string; encoding?: string }
): Promise<ConversionResponse> => {
  return processTextInput(apiEndpoints.hashText, text, options);
};

// Hash file
export const hashFile = async (
  file: File,
  options?: { algorithm?: string; output_format?: string; salt?: string; use_streaming?: boolean }
): Promise<ConversionResponse> => {
  return uploadFileForProcessing(
    apiEndpoints.hashFile,
    file,
    options
  );
};

// Decoding functions
export const decodeBase64Text = async (
  encodedText: string,
  options?: { url_safe?: boolean; validate?: boolean; output_format?: string; encoding?: string }
): Promise<ConversionResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('encoded_text', encodedText);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await api.post(apiEndpoints.decodeBase64Text, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return {
      success: true,
      message: 'Base64 decoded successfully',
      data: {
        content: response.data.decoded || response.data,
        filename: 'decoded_base64.txt',
        format: 'text/plain',
      }
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to decode base64 text');
  }
};

export const decodeBase64File = async (
  file: File,
  options?: { url_safe?: boolean; validate?: boolean }
): Promise<ConversionResponse> => {
  return uploadFileForProcessing(
    apiEndpoints.decodeBase64File,
    file,
    options
  );
};

export const decodeHexText = async (
  hexText: string,
  options?: { ignore_whitespace?: boolean; ignore_separators?: boolean; strict?: boolean; output_format?: string; encoding?: string }
): Promise<ConversionResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('hex_text', hexText);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await api.post(apiEndpoints.decodeHexText, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return {
      success: true,
      message: 'Hex decoded successfully',
      data: {
        content: response.data.decoded || response.data,
        filename: 'decoded_hex.txt',
        format: 'text/plain',
      }
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to decode hex text');
  }
};

export const decodeHexFile = async (
  file: File,
  options?: { ignore_whitespace?: boolean; ignore_separators?: boolean; strict?: boolean }
): Promise<ConversionResponse> => {
  return uploadFileForProcessing(
    apiEndpoints.decodeHexFile,
    file,
    options
  );
};

export const decodeUrlText = async (
  encodedText: string,
  options?: { encoding?: string; errors?: string; plus_spaces?: boolean }
): Promise<ConversionResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('encoded_text', encodedText);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await api.post(apiEndpoints.decodeUrlText, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return {
      success: true,
      message: 'URL decoded successfully',
      data: {
        content: response.data.decoded || response.data,
        filename: 'decoded_url.txt',
        format: 'text/plain',
      }
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to decode URL text');
  }
};

export const decodeUrlFile = async (
  file: File,
  options?: { encoding?: string; errors?: string }
): Promise<ConversionResponse> => {
  return uploadFileForProcessing(
    apiEndpoints.decodeUrlFile,
    file,
    options
  );
};

export const decodeJwtToken = async (
  token: string,
  secret: string = 'your-secret-key',
  options?: { algorithm?: string; verify?: boolean; verify_exp?: boolean; audience?: string; issuer?: string; raw_output?: boolean }
): Promise<ConversionResponse> => {
  const params = new URLSearchParams();
  params.append('token', token);
  params.append('secret', secret);
  
  let url = apiEndpoints.decodeJwtToken;
  if (options) {
    const urlParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(key, String(value));
      }
    });
    if (urlParams.toString()) {
      url += '?' + urlParams.toString();
    }
  }

  try {
    const response = await api.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return {
      success: true,
      message: 'JWT decoded successfully',
      data: {
        content: JSON.stringify(response.data, null, 2),
        filename: 'decoded_jwt.json',
        format: 'application/json',
      }
    };
  } catch (error: any) {
    console.error('JWT decode error:', error);
    throw error;
  }
};

export const decodeJwtFile = async (
  file: File,
  secret: string = 'your-secret-key',
  options?: { algorithm?: string; verify?: boolean }
): Promise<ConversionResponse> => {
  const queryParams: Record<string, unknown> = {
    secret: secret
  };
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = value;
      }
    });
  }

  return uploadFileForProcessing(
    apiEndpoints.decodeJwtFile,
    file,
    queryParams
  );
};

// Network connectivity test
export const testConnection = async (): Promise<{ 
  axios: boolean; 
  fetch: boolean; 
  details: {
    axios?: { status?: number; data?: unknown; error?: string; code?: string };
    fetch?: { status?: number; data?: unknown; error?: string };
  }
}> => {
  const results = {
    axios: false,
    fetch: false,
    details: {} as {
      axios?: { status?: number; data?: unknown; error?: string; code?: string };
      fetch?: { status?: number; data?: unknown; error?: string };
    },
  };

  // Test with axios
  try {
    const axiosResponse = await api.get(apiEndpoints.healthCheck);
    results.axios = axiosResponse.status === 200;
    results.details.axios = { status: axiosResponse.status, data: axiosResponse.data };
  } catch (error: unknown) {
    const axiosError = error as { message?: string; code?: string };
    results.details.axios = { error: axiosError.message, code: axiosError.code };
  }

  // Test with fetch
  try {
    const fetchResponse = await fetch(`${API_BASE_URL}${apiEndpoints.healthCheck}`);
    results.fetch = fetchResponse.ok;
    results.details.fetch = { 
      status: fetchResponse.status, 
      data: fetchResponse.ok ? await fetchResponse.json() : null 
    };
  } catch (error: unknown) {
    const fetchError = error as { message?: string };
    results.details.fetch = { error: fetchError.message };
  }

  return results;
};