import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './dashboard.css';
import './categoryProducts.css';
import { NAV_CATEGORIES } from '../data/navCategories';
import {
  buildApiProductUrl,
} from '../data/categoryCatalog';
import { SEARCH_CATEGORY_MAP } from '../data/searchCategoryMap';
import { getFullApiPath, getUploadFileUrl } from '../api';

const CategoryProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category.trim()) {
      navigate('/dashboard', { replace: true });
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const q = encodeURIComponent(category.trim());
        const res = await fetch(getFullApiPath(`/api/products?category=${q}`));
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setApiProducts(data);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setApiProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [category, navigate]);

  const performSearch = () => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (SEARCH_CATEGORY_MAP[trimmed]) {
      const cat = SEARCH_CATEGORY_MAP[trimmed];
      navigate(`/category?category=${encodeURIComponent(cat)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') performSearch();
  };

  const seenNames = new Set();
  const rows = [];

  for (const p of apiProducts) {
    const name = p.product || '';
    if (name) seenNames.add(name);
    rows.push({ key: p._id || name, kind: 'api', data: p });
  }

  return (
    <div className="full-width-page category-products-page">
      <header>
        <div className="top-bar">
          <div>Brand Waali Quality, Bazaar Waali Deal!</div>
          <div>Help Center | Sell On Snapdeal</div>
        </div>

        <div className="navbar">
          <Link to="/dashboard" className="logo">
            snapdeal
          </Link>
          <div className="search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search products & brands"
            />
            <button type="button" onClick={performSearch}>
              Search
            </button>
          </div>
          <div className="nav-links">
            <Link to="/cart">🛒 Cart</Link>
            <Link to="/register">👤 Sign In</Link>
          </div>
        </div>
      </header>

      <nav className="categories" aria-label="Product categories">
        <ul>
          {NAV_CATEGORIES.map(({ label, category: cat }) => (
            <li key={cat}>
              <Link
                to={`/category?category=${encodeURIComponent(cat)}`}
                className={cat === category ? 'active-category' : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className="category-products-main">
        <div className="category-products-toolbar">
          <Link to="/dashboard" className="back-to-home">
            ← Back to home
          </Link>
          <h1 className="category-products-title">{category}</h1>
        </div>

        {loading ? (
          <p className="category-products-loading">Loading products…</p>
        ) : rows.length === 0 ? (
          <p className="category-products-empty">
            No products in this category yet.
          </p>
        ) : (
          <section className="products">
            <div className="product-grid">
              {rows.map((row) => {
                const p = row.data;
                const href = buildApiProductUrl(p);
                const imgSrc = getUploadFileUrl(p.image);
                return (
                  <div key={row.key} className="product-card">
                    <Link to={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={p.product}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '200px',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          No Image
                        </div>
                      )}
                      <h3>{p.product}</h3>
                      <p className="price">₹{p.price}</p>
                      {p.description && (
                        <p className="description">{p.description}</p>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="category-products-footer">
        <div className="footer-bottom">
          © 2026 Snapdeal Clone React Project
        </div>
      </footer>
    </div>
  );
};

export default CategoryProducts;
