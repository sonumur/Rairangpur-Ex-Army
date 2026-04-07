import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const HeroContext = createContext(null);

const HEROES_TABLE = 'heroes';
const HEROES_BUCKET = 'hero-collection';
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

const mapHeroRecord = (record) => {
  const { data } = supabase.storage.from(HEROES_BUCKET).getPublicUrl(record.image_path);

  return {
    id: record.id,
    name: record.name,
    title: record.title,
    description: record.description,
    date: record.created_at,
    src: data.publicUrl,
    imagePath: record.image_path,
  };
};

export const useHeroes = () => {
  const context = useContext(HeroContext);

  if (!context) {
    throw new Error('useHeroes must be used inside HeroProvider');
  }

  return context;
};

export const HeroProvider = ({ children }) => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshHeroes = useCallback(async () => {
    if (!supabase) {
      setHeroes([]);
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: fetchError } = await withTimeout(
      supabase
        .from(HEROES_TABLE)
        .select('id, name, title, description, image_path, created_at')
        .order('created_at', { ascending: false }),
      'Loading heroes timed out. Check your Supabase table and policies.',
    );

    if (fetchError) {
      setError(fetchError.message);
      setHeroes([]);
      setLoading(false);
      return;
    }

    setHeroes((data || []).map(mapHeroRecord));
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshHeroes();
  }, [refreshHeroes]);

  const addHero = useCallback(async ({ name, title, description, file }) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await withTimeout(
      supabase.storage
        .from(HEROES_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        }),
      'Upload timed out. Check the `hero-collection` bucket and storage policies in Supabase.',
    );

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data, error: insertError } = await withTimeout(
      supabase
        .from(HEROES_TABLE)
        .insert({
          name,
          title,
          description,
          image_path: filePath,
        })
        .select('id, name, title, description, image_path, created_at')
        .single(),
      'Saving hero metadata timed out. Check the `heroes` table policies in Supabase.',
    );

    if (insertError) {
      await supabase.storage.from(HEROES_BUCKET).remove([filePath]);
      throw new Error(insertError.message);
    }

    setHeroes((prev) => [mapHeroRecord(data), ...prev]);
  }, []);

  const removeHero = useCallback(async (hero) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error: deleteError } = await withTimeout(
      supabase
        .from(HEROES_TABLE)
        .delete()
        .eq('id', hero.id),
      'Deleting the hero record timed out. Check the `heroes` table policies.',
    );

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const { error: storageError } = await withTimeout(
      supabase.storage
        .from(HEROES_BUCKET)
        .remove([hero.imagePath]),
      'Deleting the hero file timed out. Check the storage policies.',
    );

    if (storageError) {
      throw new Error(storageError.message);
    }

    setHeroes((prev) => prev.filter((item) => item.id !== hero.id));
  }, []);

  const value = useMemo(() => ({
    heroes,
    loading,
    error,
    refreshHeroes,
    addHero,
    removeHero,
  }), [addHero, error, heroes, loading, refreshHeroes, removeHero]);

  return (
    <HeroContext.Provider value={value}>
      {children}
    </HeroContext.Provider>
  );
};
