import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const ImageContext = createContext(null);

const PHOTOS_TABLE = 'photos';
const PHOTOS_BUCKET = 'photo-collection';
const REQUEST_TIMEOUT_MS = 20000;

const withTimeout = async (promise, message) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(message));
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const mapPhotoRecord = (record) => {
  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(record.image_path);

  return {
    id: record.id,
    title: record.title,
    date: record.created_at,
    src: data.publicUrl,
    imagePath: record.image_path,
  };
};

export const useImages = () => {
  const context = useContext(ImageContext);

  if (!context) {
    throw new Error('useImages must be used inside ImageProvider');
  }

  return context;
};

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshImages = useCallback(async () => {
    if (!supabase) {
      setImages([]);
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: fetchError } = await withTimeout(
      supabase
        .from(PHOTOS_TABLE)
        .select('id, title, image_path, created_at')
        .order('created_at', { ascending: false }),
      'Loading photos timed out. Check your Supabase table and policies.',
    );

    if (fetchError) {
      setError(fetchError.message);
      setImages([]);
      setLoading(false);
      return;
    }

    setImages((data || []).map(mapPhotoRecord));
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshImages();
  }, [refreshImages]);

  const addImage = useCallback(async ({ title, file }) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await withTimeout(
      supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        }),
      'Upload timed out. Check the `photo-collection` bucket and storage policies in Supabase.',
    );

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data, error: insertError } = await withTimeout(
      supabase
        .from(PHOTOS_TABLE)
        .insert({
          title,
          image_path: filePath,
        })
        .select('id, title, image_path, created_at')
        .single(),
      'Saving photo metadata timed out. Check the `photos` table policies in Supabase.',
    );

    if (insertError) {
      await supabase.storage.from(PHOTOS_BUCKET).remove([filePath]);
      throw new Error(insertError.message);
    }

    setImages((prev) => [mapPhotoRecord(data), ...prev]);
  }, []);

  const removeImage = useCallback(async (image) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error: deleteError } = await withTimeout(
      supabase
        .from(PHOTOS_TABLE)
        .delete()
        .eq('id', image.id),
      'Deleting the photo record timed out. Check the `photos` table policies.',
    );

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const { error: storageError } = await withTimeout(
      supabase.storage
        .from(PHOTOS_BUCKET)
        .remove([image.imagePath]),
      'Deleting the photo file timed out. Check the storage policies.',
    );

    if (storageError) {
      throw new Error(storageError.message);
    }

    setImages((prev) => prev.filter((item) => item.id !== image.id));
  }, []);

  const value = useMemo(() => ({
    images,
    loading,
    error,
    refreshImages,
    addImage,
    removeImage,
  }), [addImage, error, images, loading, refreshImages, removeImage]);

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  );
};
