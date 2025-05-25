import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param path The path in Firebase Storage where the file should be stored
 * @param metadata Optional metadata to attach to the file
 * @returns Promise that resolves to the download URL of the uploaded file
 */
export async function uploadFile(
  file: File, 
  path: string, 
  metadata?: Record<string, string>
): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Upload the file with optional metadata
    const uploadTask = await uploadBytes(storageRef, file, { customMetadata: metadata });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(uploadTask.ref);
    
    console.log(`File uploaded successfully to ${path}`);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload a product image to Firebase Storage
 * @param file The image file to upload
 * @param productId Optional product ID to include in the path
 * @returns Promise that resolves to the download URL of the uploaded image
 */
export async function uploadProductImage(
  file: File, 
  productId?: string
): Promise<string> {
  // Generate a unique path for the image
  const timestamp = Date.now();
  const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize filename
  const path = productId 
    ? `products/${productId}/${timestamp}_${fileName}`
    : `products/${timestamp}_${fileName}`;
  
  return uploadFile(file, path);
}

/**
 * Upload a gallery image to Firebase Storage
 * @param file The image file to upload
 * @param category Optional category to include in the path
 * @returns Promise that resolves to the download URL of the uploaded image
 */
export async function uploadGalleryImage(
  file: File, 
  category?: string
): Promise<string> {
  // Generate a unique path for the image
  const timestamp = Date.now();
  const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize filename
  const path = category 
    ? `gallery/${category}/${timestamp}_${fileName}`
    : `gallery/${timestamp}_${fileName}`;
  
  return uploadFile(file, path);
}

/**
 * Upload an order attachment to Firebase Storage
 * @param file The file to upload
 * @param orderId The order ID
 * @param userId The user ID
 * @returns Promise that resolves to the download URL of the uploaded file
 */
export async function uploadOrderAttachment(
  file: File, 
  orderId: string, 
  userId: string
): Promise<string> {
  // Generate a unique path for the file
  const timestamp = Date.now();
  const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize filename
  const path = `orders/${orderId}/${timestamp}_${fileName}`;
  
  // Add user ID to metadata for security rules
  const metadata = { userId };
  
  return uploadFile(file, path, metadata);
}

/**
 * Delete a file from Firebase Storage
 * @param url The download URL or storage path of the file to delete
 * @returns Promise that resolves when the file is deleted
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    // If the URL is a download URL, convert it to a storage path
    let path = url;
    if (url.startsWith('https://')) {
      // Extract the path from the URL
      // This is a simplified approach and may need to be adjusted based on your URL format
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
      if (pathMatch && pathMatch[1]) {
        path = decodeURIComponent(pathMatch[1]);
      } else {
        throw new Error('Could not extract path from URL');
      }
    }
    
    // Create a reference to the file
    const fileRef = ref(storage, path);
    
    // Delete the file
    await deleteObject(fileRef);
    
    console.log(`File deleted successfully: ${path}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
