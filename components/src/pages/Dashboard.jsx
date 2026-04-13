import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { Link } from 'react-router-dom';
import { NAV_CATEGORIES } from '../data/navCategories';
import { SEARCH_CATEGORY_MAP } from '../data/searchCategoryMap';
import { buildApiProductUrl, apiProductToCartItem, getUploadFileUrl } from '../data/categoryCatalog';

const HERO_SLIDES = [
  {
    title: 'Big Savings Day',
    subtitle: 'Up to 70% off on top brands',
    cta: 'Shop Now',
    href: `/category?category=${encodeURIComponent('Electronics')}`,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=450&fit=crop',
  },
  {
    title: 'Fashion Fiesta',
    subtitle: 'Trending styles for men & women',
    cta: 'Explore Fashion',
    href: `/category?category=${encodeURIComponent('Men')}`,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=450&fit=crop',
  },
  {
    title: 'Gadgets & More',
    subtitle: 'Phones, laptops & accessories',
    cta: 'View Deals',
    href: `/category?category=${encodeURIComponent('Mobile & Accessories')}`,
    image:
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1200&h=450&q=80',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  







  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      navigate('/login');
      return;
    }

    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    
    
    fetchUploadedImages();
    
    
    fetchProducts();
  }, []);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return undefined;
    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const fetchUploadedImages = async () => {
    try {
      const res = await fetch(getFullApiPath('/images'));
      const data = await res.json();
      if (data.success) {
        setUploadedImages(data.images);
      }
    } catch (err) {
      console.error("Error fetching uploaded images:", err);
    }
  };

  
  
  const fetchProducts = async () => {
    try {
      const response = await fetch(getFullApiPath('/api/products'));
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const performSearch = () => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (SEARCH_CATEGORY_MAP[trimmedSearch]) {
      const category = SEARCH_CATEGORY_MAP[trimmedSearch];
      navigate(`/category?category=${encodeURIComponent(category)}`);
    }
  };

  const addToCart = (product) => {
    const existingIndex = cart.findIndex(item => item.name === product.name);
    let updatedCart;
    
    if (existingIndex !== -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    
    navigate('/cart'); 
  
  
  
  
  
  
  
  
  };

  const buyNow = (product) => {
    const buyNowCart = [{ ...product, quantity: 1 }];
    const encodedCart = encodeURIComponent(JSON.stringify(buyNowCart));
    const total = product.price;
    navigate(`/checkout?cart=${encodedCart}&total=${total}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  return (
    <div className="full-width-page">
      
      <header>
        <div className="top-bar">
          <div>Brand Waali Quality, Bazaar Waali Deal!</div>
          <div>Help Center | Sell On Snapdeal</div>
        </div>

        <div className="navbar">
          <Link to="/dashboard" className="logo">snapdeal</Link>
          <div className="search-box">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search products & brands"
            />
            <button onClick={performSearch}>Search</button>
          </div>
          <div className="nav-links">
           
            <Link to="/cart">🛒 Cart</Link>
            <Link to="/register">👤 Sign In</Link>
            <Link to="/OrderTrack">📦 Track Order</Link>
            


          </div>
        </div>
      </header>

      
      <nav className="categories">
        <ul>
          {NAV_CATEGORIES.map(({ label, category }) => (
            <li key={category}>
              <Link to={`/category?category=${encodeURIComponent(category)}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

     
      <section className="hero-carousel" aria-roledescription="carousel" aria-label="Promotional offers">
        <div
          className="hero-carousel-track"
          style={{ transform: `translateX(-${heroIndex * 100}%)` }}
        >
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.title}
              className="hero-slide"
              aria-hidden={heroIndex !== i}
            >
              <img src={slide.image} alt="" className="hero-slide-bg" />
              <div className="hero-slide-overlay" />
              <div className="hero-slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link to={slide.href} className="cta-button">
                  {slide.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="hero-carousel-btn hero-carousel-prev"
          aria-label="Previous slide"
          onClick={() =>
            setHeroIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
          }
        >
          ‹
        </button>
        <button
          type="button"
          className="hero-carousel-btn hero-carousel-next"
          aria-label="Next slide"
          onClick={() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length)}
        >
          ›
        </button>
        <div className="hero-carousel-dots" role="tablist" aria-label="Slide indicators">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              role="tab"
              aria-selected={heroIndex === i}
              aria-label={`Go to slide ${i + 1}: ${slide.title}`}
              className={heroIndex === i ? 'is-active' : ''}
              onClick={() => setHeroIndex(i)}
            />
          ))}
        </div>
      </section>

      
      

     
      {products.length > 0 && (
        <section className="products">
          <h2>New Product Arrivals</h2>
          <div className="product-grid">
            {products.map((product) => {
              const productImage = getUploadFileUrl(product.image);
              const productUrl = buildApiProductUrl(product);
              const cartItem = apiProductToCartItem(product);

              return (
                <div key={product._id} className="product-card product-card--arrival">
                  <Link to={productUrl} className="product-card__media">
                    {product.image ? (
                      <img
                        src={productImage}
                        alt={product.product}
                      />
                    ) : (
                      <div className="product-card__placeholder">No Image</div>
                    )}
                  </Link>
                  <Link to={productUrl} className="product-card__title-link">
                    <h3>{product.product}</h3>
                  </Link>
                  <p className="price">₹{product.price}</p>
                  {product.category && (
                    <p className="product-card__category">{product.category}</p>
                  )}
                  
                </div>
              );
            })}
          </div>
        </section>
      )}













      
      {uploadedImages.length > 0 && (
        <section className="uploaded-images">
          <h2>Featured Uploads</h2>
          <div className="product-grid">
            {uploadedImages.map((img) => (
              <div key={img._id} className="product-card">
                <div className="uploaded-image-wrapper">
                  <img src={img.imageUrl} alt="Uploaded" />
                </div>
                <h3>NewProduct Arrivals </h3>
                <p className="upload-date">📅 {new Date(img.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      
      <footer>
        <div className="footer-grid">
          <div>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
          </div>
          <div>
            <h4>Help</h4>
            <a href="#">Payments</a>
            <a href="#">Shipping</a>
            <a href="#">Cancellation</a>
          </div>
          <div>
            <h4>Policy</h4>
            <a href="#">Return Policy</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Snapdeal Clone React Project
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
