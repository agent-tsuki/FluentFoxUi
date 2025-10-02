/**
 * API utilities for FileCraft backend integration
 */

import axios, { AxiosResponse } from 'axios';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for large file processing
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
  (error) => {
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
      size: response.data?.size || 'unknown',
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
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
  };
  task_id?: string;
}

export interface ProcessingStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
}

// API endpoints
export const apiEndpoints = {
  // Base64 operations
  encodeToBase64: '/api/v1/encode/base64/file',
  decodeFromBase64: '/api/v1/decode/base64/file',
  
  // Image processing
  convertImage: '/api/v1/images/convert',
  resizeImage: '/api/v1/images/resize',
  compressImage: '/api/v1/images/compress',
  
  // Video processing
  convertVideo: '/api/v1/video/convert',
  compressVideo: '/api/v1/video/compress',
  
  // Audio processing
  convertAudio: '/api/v1/audio/convert',
  
  // Compression
  compressFile: '/api/v1/compression/smart-compress',
  
  // System
  healthCheck: '/health',
  systemInfo: '/api/info',
};

// File upload with progress tracking
export const uploadFileForProcessing = async (
  endpoint: string,
  file: File,
  options?: Record<string, any>,
  onProgress?: (progress: number) => void
): Promise<ConversionResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add options if provided
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  }

  try {
    const response: AxiosResponse<Blob> = await api.post(
      endpoint,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // FastAPI returns streaming responses
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    
    // Convert blob response to base64 for frontend usage
    const resultBlob = response.data;
    const base64Result = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.readAsDataURL(resultBlob);
    });
    
    // Extract filename from response headers if available
    const contentDisposition = response.headers['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `converted_${file.name}`;
    
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
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Base64 encoding
export const encodeFileToBase64 = async (
  file: File,
  options?: { url_safe?: boolean },
  onProgress?: (progress: number) => void
): Promise<ConversionResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add options if provided
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  }

  try {
    const response: AxiosResponse<string> = await api.post(
      apiEndpoints.encodeToBase64,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'text', // FastAPI returns Base64 text
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    
    // Extract filename from response headers if available
    const contentDisposition = response.headers['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `${file.name}.base64`;
    
    return {
      success: true,
      message: 'File encoded to Base64 successfully',
      data: {
        base64: response.data,
        filename: filename,
        size: response.data.length,
        format: 'text/plain',
      }
    };
  } catch (error) {
    console.error('Encode error:', error);
    throw error;
  }
};

// Base64 decoding
export const decodeBase64 = async (
  base64String: string,
  filename?: string
): Promise<ConversionResponse> => {
  try {
    // Create a file from the base64 string for FastAPI endpoint
    const blob = new Blob([base64String], { type: 'text/plain' });
    const file = new File([blob], filename || 'base64_input.txt', { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<Blob> = await api.post(
      apiEndpoints.decodeFromBase64,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // FastAPI returns binary data
      }
    );
    
    // Convert blob response to base64 for consistency
    const resultBlob = response.data;
    const base64Result = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.readAsDataURL(resultBlob);
    });
    
    return {
      success: true,
      message: 'File decoded successfully',
      data: {
        base64: base64Result,
        filename: filename || 'decoded_file',
        size: resultBlob.size,
      }
    };
  } catch (error) {
    console.error('Decode error:', error);
    throw error;
  }
};

// Fallback function using native fetch API
const fetchWithFallback = async (
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  console.log('🔄 Trying fetch fallback for:', url);
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it automatically with boundary
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();
  onProgress?.(100); // Set progress to 100% since fetch doesn't support progress tracking
  return blob;
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
  const formData = new FormData();
  formData.append('image', file); // FastAPI expects 'image', not 'file'
  formData.append('target_format', options.format);
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (options.quality !== undefined) queryParams.append('quality', options.quality.toString());
  if (options.width !== undefined) queryParams.append('resize_width', options.width.toString());
  if (options.height !== undefined) queryParams.append('resize_height', options.height.toString());
  if (options.optimization_level) queryParams.append('optimization_level', options.optimization_level);
  if (options.maintain_aspect_ratio !== undefined) queryParams.append('maintain_aspect_ratio', options.maintain_aspect_ratio.toString());
  if (options.use_async !== undefined) queryParams.append('use_async', options.use_async.toString());
  
  const fullUrl = `${API_BASE_URL}${apiEndpoints.convertImage}?${queryParams.toString()}`;
  
  let resultBlob: Blob;
  let filename: string;

  try {
    // Try axios first
    const response: AxiosResponse<Blob> = await api.post(
      `${apiEndpoints.convertImage}?${queryParams.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // FastAPI returns streaming responses
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    
    resultBlob = response.data;
    
    // Extract filename from response headers if available
    const contentDisposition = response.headers['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    filename = filenameMatch ? filenameMatch[1] : `converted_${file.name}`;
    
  } catch (axiosError: any) {
    console.warn('⚠️ Axios failed, trying fetch fallback:', axiosError.message);
    
    // If axios fails with ERR_BLOCKED_BY_CLIENT or network error, try fetch
    if (axiosError.code === 'ERR_BLOCKED_BY_CLIENT' || axiosError.code === 'ERR_NETWORK') {
      try {
        resultBlob = await fetchWithFallback(fullUrl, formData, onProgress);
        filename = `converted_${file.name}`;
      } catch (fetchError) {
        console.error('❌ Both axios and fetch failed:', fetchError);
        throw new Error(`Image conversion failed: ${axiosError.message}. Fallback also failed: ${fetchError}`);
      }
    } else {
      throw axiosError;
    }
  }
  
  // Convert blob response to base64 for frontend usage
  const base64Result = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data URL prefix
    };
    reader.readAsDataURL(resultBlob);
  });
  
  return {
    success: true,
    message: 'Image converted successfully',
    data: {
      base64: base64Result,
      filename: filename,
      size: resultBlob.size,
      format: resultBlob.type || 'application/octet-stream',
    }
  };
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
  const formData = new FormData();
  formData.append('video', file); // FastAPI expects 'video', not 'file'
  formData.append('target_format', options.format);
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (options.quality) queryParams.append('quality_preset', options.quality);
  if (options.codec) queryParams.append('codec', options.codec);
  if (options.bitrate) queryParams.append('bitrate', options.bitrate);
  if (options.width !== undefined) queryParams.append('width', options.width.toString());
  if (options.height !== undefined) queryParams.append('height', options.height.toString());
  if (options.frame_rate !== undefined) queryParams.append('frame_rate', options.frame_rate.toString());
  
  const url = `${apiEndpoints.convertVideo}?${queryParams.toString()}`;

  try {
    const response: AxiosResponse<Blob> = await api.post(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    
    // Convert blob response to base64 for frontend usage
    const resultBlob = response.data;
    const base64Result = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.readAsDataURL(resultBlob);
    });
    
    // Extract filename from response headers if available
    const contentDisposition = response.headers['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `converted_${file.name}`;
    
    return {
      success: true,
      message: 'Video converted successfully',
      data: {
        base64: base64Result,
        filename: filename,
        size: resultBlob.size,
        format: resultBlob.type || 'application/octet-stream',
      }
    };
  } catch (error) {
    console.error('Video conversion error:', error);
    throw error;
  }
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
  const formData = new FormData();
  formData.append('audio', file); // FastAPI expects 'audio', not 'file'
  formData.append('target_format', options.format);
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (options.bitrate !== undefined) {
    // Convert bitrate string like "192k" to number
    const bitrateNum = typeof options.bitrate === 'string' 
      ? parseInt(options.bitrate.replace('k', ''))
      : options.bitrate;
    queryParams.append('bitrate', bitrateNum.toString());
  }
  if (options.sample_rate !== undefined) queryParams.append('sample_rate', options.sample_rate.toString());
  if (options.channels !== undefined) queryParams.append('channels', options.channels.toString());
  if (options.quality_preset) queryParams.append('quality_preset', options.quality_preset);
  
  const url = `${apiEndpoints.convertAudio}?${queryParams.toString()}`;

  try {
    const response: AxiosResponse<Blob> = await api.post(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    
    // Convert blob response to base64 for frontend usage
    const resultBlob = response.data;
    const base64Result = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.readAsDataURL(resultBlob);
    });
    
    // Extract filename from response headers if available
    const contentDisposition = response.headers['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `converted_${file.name}`;
    
    return {
      success: true,
      message: 'Audio converted successfully',
      data: {
        base64: base64Result,
        filename: filename,
        size: resultBlob.size,
        format: resultBlob.type || 'application/octet-stream',
      }
    };
  } catch (error) {
    console.error('Audio conversion error:', error);
    throw error;
  }
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
  const formData = new FormData();
  formData.append('file', file); // Compression endpoint uses 'file'
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (options.compression_level !== undefined) queryParams.append('compression_level', options.compression_level.toString());
  if (options.quality !== undefined) queryParams.append('quality', options.quality.toString());
  if (options.force_webp !== undefined) queryParams.append('force_webp', options.force_webp.toString());
  
  const url = `${apiEndpoints.compressFile}?${queryParams.toString()}`;

  try {
    const response: AxiosResponse<Blob> = await api.post(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    
    // Convert blob response to base64 for frontend usage
    const resultBlob = response.data;
    const base64Result = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.readAsDataURL(resultBlob);
    });
    
    // Extract filename from response headers if available
    const contentDisposition = response.headers['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `compressed_${file.name}`;
    
    return {
      success: true,
      message: 'File compressed successfully',
      data: {
        base64: base64Result,
        filename: filename,
        size: resultBlob.size,
        format: resultBlob.type || 'application/octet-stream',
      }
    };
  } catch (error) {
    console.error('Compression error:', error);
    throw error;
  }
};

// Network connectivity test
export const testConnection = async (): Promise<{ axios: boolean; fetch: boolean; details: any }> => {
  const results = {
    axios: false,
    fetch: false,
    details: {} as any,
  };

  // Test with axios
  try {
    const axiosResponse = await api.get(apiEndpoints.healthCheck);
    results.axios = axiosResponse.status === 200;
    results.details.axios = { status: axiosResponse.status, data: axiosResponse.data };
  } catch (error: any) {
    results.details.axios = { error: error.message, code: error.code };
  }

  // Test with fetch
  try {
    const fetchResponse = await fetch(`${API_BASE_URL}${apiEndpoints.healthCheck}`);
    results.fetch = fetchResponse.ok;
    results.details.fetch = { 
      status: fetchResponse.status, 
      data: fetchResponse.ok ? await fetchResponse.json() : null 
    };
  } catch (error: any) {
    results.details.fetch = { error: error.message };
  }

  return results;
};

// Health check
export const checkHealth = async (): Promise<any> => {
  try {
    const response = await api.get(apiEndpoints.healthCheck);
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};