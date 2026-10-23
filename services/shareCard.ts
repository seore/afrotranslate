// Captures a ShareCard as a PNG and opens the share sheet.

import type { RefObject } from 'react';
import type { View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

/** Returns false if sharing isn't possible or failed. */
export async function shareCard(ref: RefObject<View | null>, dialogTitle: string): Promise<boolean> {
  try {
    if (!ref.current || !(await Sharing.isAvailableAsync())) return false;
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
    await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle });
    return true;
  } catch (error) {
    console.error('Share card error:', error);
    return false;
  }
}
