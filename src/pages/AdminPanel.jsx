import React, { useEffect, useMemo, useState } from 'react';
import { useImages } from '../context/ImageContext';
import { useHeroes } from '../context/HeroContext';
import { useAdminAuth, AdminGate } from '../context/AdminAuthContext';
import { CalendarDays, CheckCheck, ImagePlus, Images, LogOut, Plus, Search, Shield, Trash2, Upload, X } from 'lucide-react';
import './AdminPanel.css';

const AdminPanelContent = () => {
  const { images, loading, error, addImage, removeImage } = useImages();
  const {
    heroes,
    loading: heroesLoading,
    error: heroesError,
    addHero,
    removeHero,
  } = useHeroes();
  const { logout } = useAdminAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddHeroForm, setShowAddHeroForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionError, setActionError] = useState('');
  const [heroActionError, setHeroActionError] = useState('');
  const [newImageData, setNewImageData] = useState({
    title: '',
    file: null,
    preview: ''
  });
  const [newHeroData, setNewHeroData] = useState({
    name: '',
    title: '',
    description: '',
    file: null,
    preview: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);

      setNewImageData((prev) => {
        if (prev.preview) {
          URL.revokeObjectURL(prev.preview);
        }

        return { ...prev, file, preview };
      });
      setActionError('');
    }
  };

  const resetDraft = () => {
    setNewImageData((prev) => {
      if (prev.preview) {
        URL.revokeObjectURL(prev.preview);
      }

      return { title: '', file: null, preview: '' };
    });
  };

  const handleHeroFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const preview = URL.createObjectURL(file);

      setNewHeroData((prev) => {
        if (prev.preview) {
          URL.revokeObjectURL(prev.preview);
        }

        return { ...prev, file, preview };
      });
      setHeroActionError('');
    }
  };

  const resetHeroDraft = () => {
    setNewHeroData((prev) => {
      if (prev.preview) {
        URL.revokeObjectURL(prev.preview);
      }

      return {
        name: '',
        title: '',
        description: '',
        file: null,
        preview: '',
      };
    });
  };

  const handleAddImage = async (e) => {
    e.preventDefault();

    if (!newImageData.file || !newImageData.title) {
      setActionError('Please provide both a title and an image.');
      return;
    }

    setIsSaving(true);
    setActionError('');

    try {
      await addImage({
        title: newImageData.title,
        file: newImageData.file,
      });
      resetDraft();
      setShowAddForm(false);
    } catch (uploadError) {
      setActionError(uploadError.message || 'Failed to upload photo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async (image) => {
    setActionError('');

    try {
      await removeImage(image);
    } catch (deleteError) {
      setActionError(deleteError.message || 'Failed to delete photo.');
    }
  };

  const filteredImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return images;
    }

    return images.filter((image) => image.title.toLowerCase().includes(query));
  }, [images, searchQuery]);

  useEffect(() => {
    const availableIds = new Set(images.map((image) => image.id));
    setSelectedIds((prev) => prev.filter((id) => availableIds.has(id)));
  }, [images]);

  const selectedCount = selectedIds.length;
  const allVisibleSelected = filteredImages.length > 0 && filteredImages.every((image) => selectedIds.includes(image.id));

  const toggleSelectImage = (imageId) => {
    setSelectedIds((prev) => {
      if (prev.includes(imageId)) {
        return prev.filter((id) => id !== imageId);
      }

      return [...prev, imageId];
    });
  };

  const toggleSelectVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredImages.map((image) => image.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredImages.forEach((image) => {
        next.add(image.id);
      });

      return Array.from(next);
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0 || isBulkDeleting) {
      return;
    }

    setIsBulkDeleting(true);
    setActionError('');

    const targets = images.filter((image) => selectedIds.includes(image.id));
    const failures = [];

    for (const image of targets) {
      try {
        await removeImage(image);
      } catch (deleteError) {
        failures.push(deleteError.message || `Failed to delete "${image.title}".`);
      }
    }

    if (failures.length > 0) {
      setActionError(failures[0]);
    }

    setSelectedIds([]);
    setIsBulkDeleting(false);
  };

  const handleAddHero = async (e) => {
    e.preventDefault();

    if (!newHeroData.name || !newHeroData.title || !newHeroData.description || !newHeroData.file) {
      setHeroActionError('Please provide hero name, hero title, description, and an image.');
      return;
    }

    setIsSavingHero(true);
    setHeroActionError('');

    try {
      await addHero({
        name: newHeroData.name,
        title: newHeroData.title,
        description: newHeroData.description,
        file: newHeroData.file,
      });
      resetHeroDraft();
      setShowAddHeroForm(false);
    } catch (uploadError) {
      setHeroActionError(uploadError.message || 'Failed to save hero.');
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleDeleteHero = async (hero) => {
    setHeroActionError('');

    try {
      await removeHero(hero);
    } catch (deleteError) {
      setHeroActionError(deleteError.message || 'Failed to delete hero.');
    }
  };

  const photoCount = images.length;
  const filteredCount = filteredImages.length;
  const heroCount = heroes.length;
  const displayDate = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="page-container admin-page">
      <header className="page-header admin-header dashboard-shell">
        <div className="admin-heading">
          <p className="admin-eyebrow">Association Console</p>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage photos and hero profiles that appear on the public website.</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="btn-secondary admin-logout-btn"
            onClick={logout}
            type="button"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <article className="stat-card">
          <span className="stat-icon">
            <Images size={20} />
          </span>
          <div>
            <p className="stat-label">Total Photos</p>
            <p className="stat-value">{photoCount}</p>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon">
            <ImagePlus size={20} />
          </span>
          <div>
            <p className="stat-label">Filtered View</p>
            <p className="stat-value">{filteredCount}</p>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon">
            <CalendarDays size={20} />
          </span>
          <div>
            <p className="stat-label">Today</p>
            <p className="stat-value">{displayDate}</p>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon">
            <Shield size={20} />
          </span>
          <div>
            <p className="stat-label">Total Heroes</p>
            <p className="stat-value">{heroCount}</p>
          </div>
        </article>
      </section>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Photo</h2>
              <button
                onClick={() => {
                  resetDraft();
                  setShowAddForm(false);
                }}
                className="close-btn"
                type="button"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddImage} className="add-image-form">
              <div className="form-group">
                <label>Photo Title</label>
                <input
                  type="text"
                  value={newImageData.title}
                  onChange={(e) => setNewImageData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Select Image</label>
                <div className="file-input-wrapper">
                  {newImageData.preview ? (
                    <div className="preview-container">
                      <img src={newImageData.preview} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        onClick={resetDraft}
                        className="remove-preview"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={40} />
                      <p>Click to upload or drag and drop</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
              {actionError ? <p className="admin-form-error">{actionError}</p> : null}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    resetDraft();
                    setShowAddForm(false);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save to Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddHeroForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Hero</h2>
              <button
                onClick={() => {
                  resetHeroDraft();
                  setShowAddHeroForm(false);
                }}
                className="close-btn"
                type="button"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddHero} className="add-image-form">
              <div className="form-group">
                <label>Hero Name</label>
                <input
                  type="text"
                  value={newHeroData.name}
                  onChange={(e) => setNewHeroData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter hero name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Hero Title</label>
                <input
                  type="text"
                  value={newHeroData.title}
                  onChange={(e) => setNewHeroData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Example: Veteran Leader"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newHeroData.description}
                  onChange={(e) => setNewHeroData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Write the hero details you want to show on the hero page"
                  required
                />
              </div>
              <div className="form-group">
                <label>Select Hero Image</label>
                <div className="file-input-wrapper">
                  {newHeroData.preview ? (
                    <div className="preview-container">
                      <img src={newHeroData.preview} alt="Hero preview" className="image-preview" />
                      <button
                        type="button"
                        onClick={resetHeroDraft}
                        className="remove-preview"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={40} />
                      <p>Click to upload or drag and drop</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroFileChange}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
              {heroActionError ? <p className="admin-form-error">{heroActionError}</p> : null}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    resetHeroDraft();
                    setShowAddHeroForm(false);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSavingHero}>
                  {isSavingHero ? 'Saving...' : 'Save Hero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error ? <div className="admin-feedback error">{error}</div> : null}
      {actionError && !showAddForm ? <div className="admin-feedback error">{actionError}</div> : null}
      {heroesError ? <div className="admin-feedback error">{heroesError}</div> : null}
      {heroActionError && !showAddHeroForm ? <div className="admin-feedback error">{heroActionError}</div> : null}

      {loading ? (
        <div className="empty-state">
          <p>Loading photos...</p>
        </div>
      ) : (
        <section className="dashboard-shell gallery-panel">
          <div className="gallery-panel-header">
            <div>
              <h2>Photo Library</h2>
              <p>{photoCount} item{photoCount === 1 ? '' : 's'} in your collection</p>
            </div>
            <button
              className="btn-primary add-btn"
              onClick={() => setShowAddForm(true)}
              type="button"
            >
              <Plus size={20} /> Add Photo
            </button>
          </div>

          <div className="gallery-toolbar">
            <label className="search-input-wrap" htmlFor="admin-photo-search">
              <Search size={16} />
              <input
                id="admin-photo-search"
                type="text"
                placeholder="Search photos by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>

            <div className="bulk-actions">
              <button
                type="button"
                className="btn-secondary add-btn"
                onClick={toggleSelectVisible}
                disabled={filteredImages.length === 0}
              >
                <CheckCheck size={18} />
                {allVisibleSelected ? 'Unselect Visible' : 'Select Visible'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={clearSelection}
                disabled={selectedCount === 0}
              >
                Clear ({selectedCount})
              </button>
              <button
                type="button"
                className="bulk-delete-btn"
                onClick={handleBulkDelete}
                disabled={selectedCount === 0 || isBulkDeleting}
              >
                <Trash2 size={18} />
                {isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedCount})`}
              </button>
            </div>
          </div>

          <div className="admin-grid">
            {filteredImages.map((image, index) => (
              <article
                key={image.id}
                className={`admin-item ${selectedIds.includes(image.id) ? 'is-selected' : ''}`}
                style={{ '--stagger': index }}
              >
                <img src={image.src} alt={image.title} className="admin-item-img" />
                <label className="item-select">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(image.id)}
                    onChange={() => toggleSelectImage(image.id)}
                  />
                  <span>Select</span>
                </label>
                <div className="admin-item-overlay">
                  <span className="admin-item-title">{image.title}</span>
                  <button
                    onClick={() => handleDeleteImage(image)}
                    className="delete-btn"
                    title="Delete Photo"
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredCount === 0 && photoCount > 0 ? (
            <div className="empty-state search-empty-state">
              <p>No photos matched your search.</p>
            </div>
          ) : null}
        </section>
      )}

      {heroesLoading ? (
        <div className="empty-state">
          <p>Loading heroes...</p>
        </div>
      ) : (
        <section className="dashboard-shell gallery-panel">
          <div className="gallery-panel-header">
            <div>
              <h2>Heroes Library</h2>
              <p>{heroCount} hero{heroCount === 1 ? '' : 'es'} ready for the public heroes page</p>
            </div>
            <button
              className="btn-primary add-btn"
              onClick={() => setShowAddHeroForm(true)}
              type="button"
            >
              <Plus size={20} /> Add Hero
            </button>
          </div>

          <div className="admin-hero-grid">
            {heroes.map((hero) => (
              <article key={hero.id} className="admin-hero-card">
                <img src={hero.src} alt={hero.name} className="admin-hero-image" />
                <div className="admin-hero-body">
                  <p className="admin-hero-role">{hero.title}</p>
                  <h3 className="admin-hero-name">{hero.name}</h3>
                  <p className="admin-hero-description">{hero.description}</p>
                  <div className="admin-hero-actions">
                    <button
                      onClick={() => handleDeleteHero(hero)}
                      className="delete-btn"
                      title="Delete Hero"
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {heroCount === 0 ? (
            <div className="empty-state search-empty-state">
              <p>No heroes found. Add one to publish it on the Heroes page.</p>
            </div>
          ) : null}
        </section>
      )}

      {images.length === 0 && !showAddForm && !loading && (
        <div className="empty-state">
          <p>No photos found. Start by adding one!</p>
        </div>
      )}
    </div>
  );
};

const AdminPanel = () => (
  <AdminGate>
    <AdminPanelContent />
  </AdminGate>
);

export default AdminPanel;
