import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useImages } from '../context/ImageContext';
import Seo from '../components/Seo';
import './PhotoCollection.css';

const PhotoCollection = () => {
  const { images, loading, error } = useImages();
  const [activeImage, setActiveImage] = useState(null);

  const activeIndex = activeImage
    ? images.findIndex((image) => image.id === activeImage.id)
    : -1;

  const showPreviousImage = () => {
    if (activeIndex <= 0) {
      return;
    }

    setActiveImage(images[activeIndex - 1]);
  };

  const showNextImage = () => {
    if (activeIndex === -1 || activeIndex >= images.length - 1) {
      return;
    }

    setActiveImage(images[activeIndex + 1]);
  };

  return (
    <div className="page-container photos-page">
      <Seo
        title="Photo Collection"
        description="Explore the Rairangpur Ex-Army Association photo collection featuring events, gatherings, and memorable community moments."
        path="/photos"
        image={images[0]?.src || '/PMIndia.jpeg'}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: 'Rairangpur Ex-Army Association Photo Collection',
          description: 'Photo archive of the Rairangpur Ex-Army Association.',
          url: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/photos`,
        }}
      />
      <header className="page-header">
        <p className="gallery-kicker">Archive</p>
        <h1 className="page-title">Photo Collection</h1>
        <p className="page-subtitle">Captured moments from our association's journey</p>
      </header>

      {error ? <div className="gallery-feedback error">{error}</div> : null}

      {loading ? (
        <div className="empty-state">
          <p>Loading photo collection...</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {images.map((image) => (
            <button
              key={image.id}
              className="gallery-item"
              type="button"
              onClick={() => setActiveImage(image)}
            >
              <div className="gallery-image-container">
                <img src={image.src} alt={image.title} className="gallery-image" />
                <div className="gallery-overlay">
                  <div className="gallery-overlay-content">
                    <p className="gallery-overlay-date">{new Date(image.date).toLocaleDateString()}</p>
                    <h3 className="gallery-overlay-title">{image.title}</h3>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {images.length === 0 && !loading && (
        <div className="empty-state">
          <p>No photos added yet. Head to the Admin panel to upload some!</p>
        </div>
      )}

      {activeImage ? (
        <div
          className="lightbox-backdrop"
          role="presentation"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="lightbox-panel"
            role="dialog"
            aria-modal="true"
            aria-label={activeImage.title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lightbox-media">
              {activeIndex > 0 ? (
                <button
                  className="lightbox-nav lightbox-nav-prev"
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
              ) : null}

              {activeIndex < images.length - 1 ? (
                <button
                  className="lightbox-nav lightbox-nav-next"
                  type="button"
                  onClick={showNextImage}
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              ) : null}

              <button
                className="lightbox-close"
                type="button"
                onClick={() => setActiveImage(null)}
              >
                <X size={24} />
              </button>
              <img src={activeImage.src} alt={activeImage.title} className="lightbox-image" />
            </div>
            <div className="lightbox-meta">
              <p className="lightbox-date">{new Date(activeImage.date).toLocaleDateString()}</p>
              <h2 className="lightbox-title">{activeImage.title}</h2>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PhotoCollection;
