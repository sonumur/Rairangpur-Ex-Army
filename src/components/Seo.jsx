import { useEffect } from 'react';

const DEFAULT_TITLE = 'Rairangpur Ex-Army Association';
const DEFAULT_DESCRIPTION = 'Official website of the Rairangpur Ex-Army Association, highlighting our veterans community, events, and photo collection.';
const DEFAULT_IMAGE = '/logo.png';
const SITE_NAME = 'Rairangpur Ex-Army Association';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://example.com').replace(/\/$/, '');

const ensureMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
};

const ensureLink = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
};

const ensureScript = (id, content) => {
  let element = document.head.querySelector(`#${id}`);

  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.id = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(content);
};

const toAbsoluteUrl = (value) => {
  if (!value) {
    return `${SITE_URL}${DEFAULT_IMAGE}`;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const Seo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  structuredData,
}) => {
  useEffect(() => {
    const fullTitle = title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`;
    const imageUrl = toAbsoluteUrl(image);

    document.title = fullTitle;
    document.documentElement.lang = 'en';

    ensureMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    });
    ensureMeta('meta[name="robots"]', {
      name: 'robots',
      content: 'index, follow',
    });
    ensureMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: fullTitle,
    });
    ensureMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });
    ensureMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: type,
    });
    ensureMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    });
    ensureMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: imageUrl,
    });
    ensureMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: SITE_NAME,
    });
    ensureMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    ensureMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: fullTitle,
    });
    ensureMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    });
    ensureMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: imageUrl,
    });
    ensureLink('link[rel="canonical"]', {
      rel: 'canonical',
      href: canonicalUrl,
    });

    if (structuredData) {
      ensureScript('seo-structured-data', structuredData);
    }
  }, [description, image, path, structuredData, title]);

  return null;
};

export default Seo;
