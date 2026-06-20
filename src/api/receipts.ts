import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

export const RECEIPTS_BUCKET = 'receipts';

export interface ParsedReceipt {
  amount: number | null;
  expense_date: string | null; // YYYY-MM-DD
  merchant: string | null;
}

export interface PickedImage {
  uri: string;
  mimeType: string;
}

// Launch the camera or the media library. Returns null if cancelled/denied.
export async function pickReceiptImage(
  source: 'camera' | 'library',
): Promise<PickedImage | null> {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('Camera permission denied');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled) return null;
    const asset = result.assets[0];
    return { uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' };
  }

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Photo library permission denied');
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' };
}

// Upload an image to the per-user folder in the private 'receipts' bucket.
// Returns the storage path (stored in expenses.receipt_url).
export async function uploadReceipt(image: PickedImage): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const ext = image.mimeType.includes('png') ? 'png' : 'jpg';
  const path = `${userData.user.id}/${Crypto.randomUUID()}.${ext}`;

  const response = await fetch(image.uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: image.mimeType,
      upsert: false,
    });
  if (error) throw error;
  return path;
}

// Resolve a temporary signed URL for displaying a stored receipt.
export async function getReceiptSignedUrl(
  path: string,
  expiresIn = 60 * 60,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

// Call the OCR edge function with the storage path. The function downloads the
// image (service role), runs OCR, and returns parsed fields.
export async function parseReceipt(path: string): Promise<ParsedReceipt> {
  const { data, error } = await supabase.functions.invoke<ParsedReceipt>(
    'parse-receipt',
    { body: { bucket: RECEIPTS_BUCKET, path } },
  );
  if (error) throw error;
  return (
    data ?? { amount: null, expense_date: null, merchant: null }
  );
}
