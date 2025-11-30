// Simple encryption utility using Web Crypto API
// This encrypts data client-side before sending to Supabase

const ALGORITHM = 'AES-GCM';

// Derive a key from user's password/email (in production, use a proper key derivation function)
async function deriveKey(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('ossu-tracker-salt'), // In production, use unique salt per user
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptData(data, userEmail) {
    try {
        const key = await deriveKey(userEmail);
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector

        const encrypted = await crypto.subtle.encrypt(
            { name: ALGORITHM, iv },
            key,
            encoder.encode(JSON.stringify(data))
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption failed:', error);
        return JSON.stringify(data); // Fallback to unencrypted
    }
}

export async function decryptData(encryptedString, userEmail) {
    try {
        const key = await deriveKey(userEmail);

        // Decode from base64
        const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));

        // Extract IV and encrypted data
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: ALGORITHM, iv },
            key,
            encrypted
        );

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
        console.error('Decryption failed:', error);
        // Try parsing as unencrypted JSON (for backward compatibility)
        try {
            return JSON.parse(encryptedString);
        } catch {
            return null;
        }
    }
}
