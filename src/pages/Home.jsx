import React from 'react';
import Seo from '../components/Seo';

function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rairangpur Ex-Army Association',
    url: import.meta.env.VITE_SITE_URL || 'https://example.com',
    logo: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/logo.png`,
    description: 'Veterans association website for Rairangpur featuring community information, events, and photos.',
  };

  return (
    <>
      <Seo
        title="Home"
        description="Rairangpur Ex-Army Association brings veterans together to strengthen community, share service memories, and highlight association events."
        path="/"
        image="/PMIndia.jpeg"
        structuredData={structuredData}
      />
      <main className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">Welcome to the Ex-Army Family</span>
            <h1 className="hero-title">Rairangpur Ex-Army<br />Association</h1>
            <p className="hero-subtitle">
              We are a dedicated group of veterans coming together to share our experiences to build a stronger communitys, and support each other.
            </p>
            <div className="hero-actions">
              <a href="#about-section" className="btn-primary">Click to know more</a>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-image-container">
              <img src="/PMIndia.jpeg" alt="Rairangpur Ex-Army Group" className="hero-image" />
              <div className="hero-image-overlay"></div>
            </div>
          </div>
        </div>
      </main>

      <section id="about-section" className="about-section">
        <div className="about-container">
          <div className="about-header">
            <span className="about-badge">About Us</span>
            <h2 className="about-title">Rairangpur Ex-Army Association</h2>
          </div>

          <p className="about-description">
            Rairangpur Ex-Army Association is a veterans-led community dedicated to unity discipline and service.
            We bring ex-servicemen and families together to preserve military values support one another and build
            a stronger social network for current and future generations.
          </p>

          <div className="about-grid">
            <article className="about-card">
              <h3>Our Mission</h3>
              <p>Connect veterans and families while promoting welfare, respect and collective growth.</p>
            </article>
            <article className="about-card">
              <h3>What We Do</h3>
              <p>Organize reunions community initiatives remembrance events and memory preservation programs.</p>
            </article>
            <article className="about-card">
              <h3>Core Values</h3>
              <p>Discipline, brotherhood, integrity, and nation-first commitment in every activity we lead.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="event-section" className="event-section">
        <div className="event-container">
          <div className="event-image-wrapper">
            <img src="/gettogather2026.jpeg" alt="Ex-Army Get Together 2026" className="event-image" />
          </div>
          <div className="event-content">
            <h2 className="event-title">Get Together 2026</h2>
            <p className="event-description">
              We look forward to gathering our family in arms for our grand 2026 reunion. Let us reunite reminisce about our days of service and strengthen the enduring bonds of the Rairangpur Ex-Army Association.
            </p>
          </div>
        </div>
      </section>

      <section className="video-section">
        <div className="video-container">
          <h2 className="video-title">Watch Our Video</h2>
          <div className="video-wrapper">
            <iframe
              src="https://www.youtube-nocookie.com/embed/z-fwdF7CfBk?rel=0"
              title="Rairangpur Ex-Army Association video"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen>
            </iframe>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
