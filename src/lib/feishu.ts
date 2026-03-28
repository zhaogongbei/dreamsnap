/**
 * Feishu 图片上传和发送服务
 * 
 * 由于飞书 WebHook 无法直接上传图片，需要通过后端 API 处理
 * 
 * 使用方法：
 * 1. 如果有飞书 App ID 和 Secret，可以获取 Tenant Access Token
 * 2. 使用 Token 上传图片到飞书
 * 3. 获得 image_key 后，通过 WebHook 发送消息
 */

import axios from 'axios';

const FEISHU_WEBHOOK = import.meta.env.VITE_FEISHU_WEBHOOK;
const FEISHU_APP_ID = import.meta.env.VITE_FEISHU_APP_ID;
const FEISHU_APP_SECRET = import.meta.env.VITE_FEISHU_APP_SECRET;

// Cache for tenant access token
let tenantAccessToken: string | null = null;
let tokenExpireTime: number = 0;

/**
 * Get Tenant Access Token from Feishu
 * 需要 App ID 和 Secret
 */
const getTenantAccessToken = async (): Promise<string | null> => {
  try {
    if (!FEISHU_APP_ID || !FEISHU_APP_SECRET) {
      console.warn('Feishu App ID or Secret not configured');
      return null;
    }

    // Check if token is still valid
    if (tenantAccessToken && Date.now() < tokenExpireTime) {
      return tenantAccessToken;
    }

    console.log('Fetching new Tenant Access Token from Feishu...');

    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: FEISHU_APP_ID,
        app_secret: FEISHU_APP_SECRET,
      },
      {
        timeout: 10000,
      }
    );

    if (response.data.code === 0) {
      tenantAccessToken = response.data.tenant_access_token;
      const expiresIn = response.data.expire;
      tokenExpireTime = Date.now() + (expiresIn - 300) * 1000; // Refresh 5 min before expiry
      console.log('✅ Got Tenant Access Token');
      return tenantAccessToken;
    } else {
      console.error('Failed to get token:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error getting Tenant Access Token:', error);
    return null;
  }
};

/**
 * Upload image to Feishu and get image_key
 */
const uploadImageToFeishu = async (
  imageBase64: string,
  imageName: string = 'photo.jpg'
): Promise<string | null> => {
  try {
    const token = await getTenantAccessToken();
    if (!token) {
      console.warn('Cannot upload image: No Tenant Access Token');
      return null;
    }

    // Convert base64 to blob
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Create FormData
    const formData = new FormData();
    formData.append('image_type', 'message');
    formData.append('image', blob, imageName);

    console.log('Uploading image to Feishu...');

    const response = await axios.post(
      'https://open.feishu.cn/open-apis/im/v1/images',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      }
    );

    if (response.data.code === 0) {
      const imageKey = response.data.data.image_key;
      console.log('✅ Image uploaded, key:', imageKey);
      return imageKey;
    } else {
      console.error('Failed to upload image:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Send image message via WebHook
 */
export const sendPhotoToFeishu = async ({
  imageBase64,
  caption,
  imageName = 'DreamSnap Photo',
}: {
  imageBase64: string;
  caption: string;
  imageName?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!FEISHU_WEBHOOK) {
      return {
        success: false,
        error: '飞书机器人未配置',
      };
    }

    console.log('Preparing to send photo to Feishu...');

    // Try to upload image if we have credentials
    let imageKey: string | null = null;
    if (FEISHU_APP_ID && FEISHU_APP_SECRET) {
      imageKey = await uploadImageToFeishu(imageBase64, imageName);
    }

    // Send message via WebHook
    let payload: any;

    if (imageKey) {
      // Send with image
      payload = {
        msg_type: "image",
        content: {
          image_key: imageKey,
        }
      };
    } else {
      // Fallback: Send as interactive card with text
      payload = {
        msg_type: "interactive",
        card: {
          config: {
            wide_screen_mode: true,
            enable_forward: true
          },
          header: {
            title: {
              tag: "plain_text",
              content: "✨ DreamSnap 新照片"
            },
            template: "blue"
          },
          elements: [
            {
              tag: "div",
              text: {
                tag: "lark_md",
                content: caption
              }
            },
            {
              tag: "hr"
            },
            {
              tag: "note",
              elements: [
                {
                  tag: "plain_text",
                  content: "📷 照片已生成，请在 App 中查看完整内容"
                }
              ]
            }
          ]
        }
      };
    }

    console.log('Sending message to Feishu WebHook...');

    const response = await axios.post(FEISHU_WEBHOOK, payload, {
      timeout: 30000,
    });

    if (response.data && response.data.code === 0) {
      console.log('✅ Message sent to Feishu successfully!');
      return { success: true };
    } else {
      console.error('❌ Feishu error:', response.data);
      return {
        success: false,
        error: response.data?.msg || '发送失败',
      };
    }
  } catch (error) {
    console.error('Error sending to Feishu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
};

/**
 * Send text message to Feishu
 */
export const sendTextToFeishu = async (text: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!FEISHU_WEBHOOK) {
      return {
        success: false,
        error: '飞书机器人未配置',
      };
    }

    const payload = {
      msg_type: "text",
      content: {
        text: text
      }
    };

    const response = await axios.post(FEISHU_WEBHOOK, payload, {
      timeout: 30000,
    });

    if (response.data && response.data.code === 0) {
      return { success: true };
    } else {
      return {
        success: false,
        error: response.data?.msg || '发送失败',
      };
    }
  } catch (error) {
    console.error('Error sending text to Feishu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
};

/**
 * Create formatted message
 */
export const createFeishuMessage = (fullName: string, theme: string): string => {
  return `✨ **${fullName}**\n🎨 主题: ${theme}\n\n来自 DreamSnap`;
};

/**
 * Send photo notification
 */
export const sendNewPhotoNotification = async (
  imageBase64: string,
  fullName: string,
  theme: string
): Promise<{ success: boolean; error?: string }> => {
  const message = createFeishuMessage(fullName, theme);
  return sendPhotoToFeishu({
    imageBase64,
    caption: message,
  });
};
