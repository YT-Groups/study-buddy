const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type UploadImageResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export const uploadImage = async (file: File): Promise<UploadImageResult> => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: 'File size must be less than 5MB'
    };
  }

  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      error: 'File must be an image'
    };
  }

  try {
    // For demo purposes, we'll create an object URL
    // In a real app, you would upload to a server and get a URL back
    const url = URL.createObjectURL(file);
    return {
      success: true,
      url
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to upload image'
    };
  }
};
