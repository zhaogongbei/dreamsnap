import axios from 'axios';
import imageCompression from 'browser-image-compression';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_BASE_URL = import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
const GEMINI_BACKUP_URL_1 = import.meta.env.VITE_GEMINI_BACKUP_URL_1;
const GEMINI_BACKUP_URL_2 = import.meta.env.VITE_GEMINI_BACKUP_URL_2;

// API URLs list for failover
const API_URLS = [
  GEMINI_BASE_URL,
  GEMINI_BACKUP_URL_1,
  GEMINI_BACKUP_URL_2,
].filter(Boolean); // Remove undefined values

// Use local proxy in development to avoid CORS issues
const getApiBaseUrl = (index: number = 0) => {
  const url = API_URLS[index] || GEMINI_BASE_URL;
  if (import.meta.env.DEV) {
    // In development, use proxy for all URLs
    return '/api/gemini'; // Vite proxy → primary URL
  }
  return url;
};

export interface GenerateImageParams {
  imageBase64: string;
  prompt: string;
  referenceImageUrl?: string;
}

/**
 * Compress base64 image to reduce size before sending to API
 */
const compressBase64Image = async (base64: string, maxSizeMB: number = 1): Promise<string> => {
  // Convert base64 to blob
  const byteString = atob(base64.split(',')[1] || base64);
  const mimeType = base64.split(',')[0]?.split(':')[1]?.split(';')[0] || 'image/jpeg';
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeType });

  // Compress
  const compressed = await imageCompression(blob as File, {
    maxSizeMB,
    maxWidthOrHeight: 1536,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.85,
  });

  // Convert back to base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressed);
  });
};

/**
 * Fetch and convert reference image to base64
 */
const fetchReferenceImageBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.replace(/^data:image\/\w+;base64,/, '');
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching reference image:', error);
    throw new Error('Failed to load reference image');
  }
};

/**
 * Generate AI-transformed image using Gemini 2.5 Flash Image via custom API
 * Supports failover to backup URLs if primary fails
 */
export const generateImageWithGemini = async ({
  imageBase64,
  prompt,
  referenceImageUrl,
}: GenerateImageParams): Promise<string> => {
  let lastError: Error | null = null;

  // Try each API URL in order
  for (let urlIndex = 0; urlIndex < API_URLS.length; urlIndex++) {
    try {
      return await generateImageWithUrl(imageBase64, prompt, referenceImageUrl, urlIndex);
    } catch (error) {
      lastError = error as Error;
      console.warn(`API URL ${urlIndex + 1} failed, trying next...`, error);
      
      // If this is the last URL, throw the error
      if (urlIndex === API_URLS.length - 1) {
        throw lastError;
      }
      
      // Wait a bit before trying next URL
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error('All API URLs failed');
};

/**
 * Internal function to generate image with a specific API URL
 */
const generateImageWithUrl = async (
  imageBase64: string,
  prompt: string,
  referenceImageUrl: string | undefined,
  urlIndex: number
): Promise<string> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    console.log('=== Gemini Image Generation Start ===');
    console.log('API Base URL:', GEMINI_BASE_URL);
    console.log('API Key prefix:', GEMINI_API_KEY.substring(0, 10) + '...');
    console.log('Original image base64 length:', imageBase64.length);

    // Compress image to reduce upload size
    console.log('Compressing image...');
    const compressedImage = await compressBase64Image(imageBase64, 1);
    const base64Data = compressedImage.replace(/^data:image\/\w+;base64,/, '');
    console.log('Compressed image base64 length:', base64Data.length);
    console.log('Compressed image size ~', Math.round(base64Data.length * 0.75 / 1024 / 1024), 'MB');

    // Load reference image if provided
    let referenceImageBase64: string | null = null;
    if (referenceImageUrl) {
      console.log('Loading reference image from:', referenceImageUrl);
      referenceImageBase64 = await fetchReferenceImageBase64(referenceImageUrl);
      console.log('Reference image loaded, base64 length:', referenceImageBase64.length);
    }

    // Build the full prompt
    const fullPrompt = referenceImageBase64
      ? `${prompt}\n\nUSE THIS REFERENCE IMAGE AS A STYLE GUIDE for lighting, atmosphere, and overall aesthetic. Match the style shown in the reference while keeping the person's appearance unchanged.`
      : prompt;

    console.log('Prompt:', fullPrompt.substring(0, 200) + '...');

    // Prepare contents for the API
    const contents: any[] = [
      {
        role: 'user',
        parts: [
          { text: fullPrompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
        ],
      },
    ];

    // Add reference image if available
    if (referenceImageBase64) {
      contents[0].parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: referenceImageBase64,
        },
      });
      console.log('Added reference image to prompt');
    }

    // Call the custom API
    console.log('Sending request to API...');
    const baseUrl = getApiBaseUrl(urlIndex);
    const apiUrl = `${baseUrl}/models/gemini-2.5-flash-image:generateContent`;
    console.log(`API URL (${urlIndex + 1}/${API_URLS.length}):`, apiUrl);

    const response = await axios.post(
      apiUrl,
      {
        contents,
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
          'x-api-key': GEMINI_API_KEY,
        },
        timeout: 300000,
        withCredentials: false,
      }
    );

    console.log('API Response status:', response.status);
    console.log('API Response data (first 500 chars):', JSON.stringify(response.data).substring(0, 500));

    // Extract image from response
    const candidates = response.data.candidates;
    if (!candidates || candidates.length === 0) {
      const blockReason = response.data.promptFeedback?.blockReason;
      throw new Error(
        blockReason
          ? `Request blocked: ${blockReason}`
          : 'No candidates in API response'
      );
    }

    const parts = candidates[0].content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error('No parts in API response');
    }

    // Log all parts for debugging
    parts.forEach((part: any, i: number) => {
      if (part.text) console.log(`Part ${i}: TEXT = "${part.text.substring(0, 100)}"`);
      if (part.inlineData) console.log(`Part ${i}: IMAGE mime=${part.inlineData.mimeType} len=${part.inlineData.data?.length}`);
    });

    // Find image part
    const imagePart = parts.find((part: any) => part.inlineData);
    if (!imagePart?.inlineData) {
      const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text).join(' ');
      throw new Error(
        textParts
          ? `API returned text instead of image: "${textParts.substring(0, 200)}"`
          : 'No image data found in API response'
      );
    }

    const generatedImageData = imagePart.inlineData.data;
    const generatedMimeType = imagePart.inlineData.mimeType || 'image/jpeg';

    console.log('✅ Image generation successful!');
    console.log('Generated MIME type:', generatedMimeType);
    console.log('Generated image data length:', generatedImageData?.length);

    return `data:${generatedMimeType};base64,${generatedImageData}`;

  } catch (error) {
    console.error('=== Gemini Image Generation Error ===');

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error('HTTP Status:', status);
      console.error('Response data:', JSON.stringify(data)?.substring(0, 500));
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error(`网络错误：无法连接到 API 服务器 (${GEMINI_BASE_URL})。请检查网络连接或 API 地址是否正确。`);
      } else if (status === 401) {
        throw new Error('API Key 无效或认证失败，请检查 API Key');
      } else if (status === 429) {
        throw new Error('请求频率超限，请稍后重试');
      } else if (status === 403) {
        throw new Error('API 访问被拒绝，请检查 API Key 权限');
      } else if (status === 400) {
        throw new Error(`请求格式错误: ${JSON.stringify(data)?.substring(0, 200)}`);
      }
    }

    throw new Error(
      `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Mock function for development/testing without API
export const mockGenerateImage = async (
  imageBase64: string,
  _prompt: string
): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return imageBase64;
};
