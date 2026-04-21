'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image, GripVertical, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  bucket?: string;
  folder?: string;
}

const labels = {
  dragDrop: { en: 'Drag images here or click to upload', fr: 'Glissez les images ici ou cliquez pour télécharger' },
  uploading: { en: 'Uploading...', fr: 'Téléchargement...' },
  uploadFailed: { en: 'Upload failed', fr: 'Échec du téléchargement' },
  mainImage: { en: 'Main', fr: 'Principal' },
  remove: { en: 'Remove', fr: 'Supprimer' },
  supportedFormats: { en: 'Max: 5MB • 800-1200px • JPEG, PNG, WebP', fr: 'Max: 5Mo • 800-1200px • JPEG, PNG, WebP' },
  previewFailed: { en: 'Preview not available', fr: 'Aperçu non disponible' },
};

export default function ImageUploader({ images, onChange, bucket = 'products', folder = 'images' }: ImageUploaderProps) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewErrors, setPreviewErrors] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 5 * 1024 * 1024) {
        console.error('File too large:', file.name);
        continue;
      }

      const url = await uploadToSupabase(file);
      if (url) {
        newImages.push(url);
      }
    }

    setUploading(false);
    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
  }, [images, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleMakeMain = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [main] = newImages.splice(index, 1);
    newImages.unshift(main);
    onChange(newImages);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onChange(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index >= images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          dragOver
            ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
            {t(labels.uploading)}
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t(labels.dragDrop)}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{t(labels.supportedFormats)}</p>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              className={`relative group rounded-lg overflow-hidden border-2 transition ${
                index === 0 ? 'border-zinc-900 dark:border-white' : 'border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800">
                {previewErrors[index] ? (
                  <div className="flex items-center justify-center w-full h-full text-zinc-400">
                    <Image className="w-8 h-8" />
                    <span className="text-xs ml-2">{t(labels.previewFailed)}</span>
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => setPreviewErrors((prev) => ({ ...prev, [index]: true }))}
                  />
                )}
                
                <div className="absolute top-2 left-2">
                  {index === 0 ? (
                    <span className="px-2 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {t(labels.mainImage)}
                    </span>
                  ) : null}
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleMakeMain(index)}
                    className="p-1.5 bg-white dark:bg-zinc-900 rounded shadow text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    title="Make main"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 bg-white/80 dark:bg-zinc-900/80 rounded text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <GripVertical className="w-3 h-3 rotate-[-90deg]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === images.length - 1}
                        className="p-1.5 bg-white/80 dark:bg-zinc-900/80 rounded text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <GripVertical className="w-3 h-3 rotate-90deg" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}