'use client';
import { useState } from 'react';
import { Lock, Unlock, FileText, Download, ShieldCheck, Info, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FileEncryptionPage() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [processing, setProcessing] = useState(false);

  // PBKDF2 Key Derivation Function
  async function getKey(passphraseStr: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphraseStr),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt file using AES-256-GCM
  const handleEncrypt = async () => {
    if (!file || !passphrase) {
      toast.error('Please select a file and enter a passphrase');
      return;
    }

    setProcessing(true);
    try {
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const key = await getKey(passphrase, salt);

      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv as unknown as BufferSource },
        key,
        fileBytes as unknown as BufferSource
      );

      // Prepend Salt (16 bytes) + IV (12 bytes) to ciphertext
      const resultBytes = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
      resultBytes.set(salt, 0);
      resultBytes.set(iv, salt.byteLength);
      resultBytes.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

      // Trigger browser download
      const blob = new Blob([resultBytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.enc`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('File encrypted & downloaded successfully!');
    } catch {
      toast.error('Encryption failed');
    } finally {
      setProcessing(false);
    }
  };

  // Decrypt file using AES-256-GCM
  const handleDecrypt = async () => {
    if (!file || !passphrase) {
      toast.error('Please select an encrypted (.enc) file and enter the passphrase');
      return;
    }

    setProcessing(true);
    try {
      const fileBytes = new Uint8Array(await file.arrayBuffer());

      if (fileBytes.byteLength < 28) {
        toast.error('Invalid encrypted file payload format');
        setProcessing(false);
        return;
      }

      // Extract Salt (16 bytes), IV (12 bytes), and Ciphertext
      const salt = fileBytes.slice(0, 16);
      const iv = fileBytes.slice(16, 28);
      const ciphertext = fileBytes.slice(28);

      const key = await getKey(passphrase, salt);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as unknown as BufferSource },
        key,
        ciphertext as unknown as BufferSource
      );

      // Clean original filename (strip .enc extension if present)
      const origName = file.name.endsWith('.enc') ? file.name.slice(0, -4) : `decrypted_${file.name}`;

      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = origName;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('File decrypted & downloaded successfully!');
    } catch {
      toast.error('Decryption failed. Incorrect passphrase or corrupted file.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="glass-card p-6 border border-white/5 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Client-Side AES-256-GCM Vault
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Zero-knowledge encryption using standard Web Crypto API with 100,000 PBKDF2 iterations.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 max-w-xs">
        <button
          onClick={() => setMode('encrypt')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'encrypt'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" /> Encrypt File
        </button>
        <button
          onClick={() => setMode('decrypt')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'decrypt'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Unlock className="w-3.5 h-3.5" /> Decrypt File
        </button>
      </div>

      {/* Form Card */}
      <div className="glass-card p-6 border border-white/5 space-y-6">
        {/* File Dropzone / Select */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Select File to {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          </label>
          <div className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-2xl p-8 text-center transition-colors relative cursor-pointer bg-white/[0.01]">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              {file ? (
                <div>
                  <p className="text-sm font-bold text-blue-400">{file.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-300 font-medium">
                    Drag and drop file here, or <span className="text-blue-400 underline">browse</span>
                  </p>
                  <p className="text-xs text-gray-500">Supports all file types (images, pdf, zip, docs)</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Passphrase Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Encryption Secret Passphrase
          </label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter high-entropy passphrase..."
            className="input-field"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
          disabled={processing || !file || !passphrase}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'encrypt' ? 'btn-primary' : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {processing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Download className="w-4 h-4" /> Execute {mode === 'encrypt' ? 'Encryption' : 'Decryption'} &amp; Download
            </>
          )}
        </button>

        {/* Zero-Knowledge security note */}
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-400/80 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Your passphrase and unencrypted contents remain in local Web Workers/RAM only.</span>
        </div>
      </div>
    </div>
  );
}
