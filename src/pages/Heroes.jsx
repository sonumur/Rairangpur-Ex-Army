import React from 'react';
import Seo from '../components/Seo';
import { useHeroes } from '../context/HeroContext';
import './Heroes.css';

const Heroes = () => {
  const { heroes, loading, error } = useHeroes();

  return (
    <div className="page-container heroes-page">
      <Seo
        title="Heroes"
        description="Meet the heroes of the Rairangpur Ex-Army Association through a curated collection of portraits and life details."
        path="/heroes"
        image={heroes[0]?.src || '/PMIndia.jpeg'}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Rairangpur Ex-Army Association Heroes',
          description: 'Hero profiles curated by the Rairangpur Ex-Army Association.',
          url: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/heroes`,
        }}
      />

      <header className="page-header heroes-header">
        <p className="heroes-kicker">Heroes</p>
        <h1 className="page-title">Our Heroes</h1>
        <p className="page-subtitle">
          A proud space to honor the people whose service, sacrifice and leadership continue to inspire our community.
        </p>
      </header>

      {error ? <div className="gallery-feedback error">{error}</div> : null}

      {loading ? (
        <div className="empty-state">
          <p>Loading heroes...</p>
        </div>
      ) : null}

      {!loading && heroes.length > 0 ? (
        <section className="heroes-grid">
          {heroes.map((hero) => (
            <article key={hero.id} className="hero-card">
              <div className="hero-card-image-wrap">
                <img src={hero.src} alt={hero.name} className="hero-card-image" />
              </div>
              <div className="hero-card-body">
                <p className="hero-card-role">{hero.title}</p>
                <h2 className="hero-card-name">{hero.name}</h2>
                <p className="hero-card-description">{hero.description}</p>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && heroes.length === 0 ? (
        <div className="empty-state">
          <p>No heroes added by the Admin yet.</p>
        </div>
      ) : null}
    </div>
  );
};

export default Heroes;
