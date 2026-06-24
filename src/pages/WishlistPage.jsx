import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllWishlist, deleteWishlistItem, updateWishlistStatus } from '../redux/slices/wishlistSlice';
import { addToCart, addToGuestCart, getCart } from '../redux/slices/cartSlice';
import { toast } from 'react-hot-toast';

export default function WishlistContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { wishlistData, isLoading } = useSelector((state) => state.wishlist);
  const { cartData } = useSelector((state) => state.cart);
  const { isLoggedIn } = useSelector((state) => state.auth);

  const [updatingStatus, setUpdatingStatus] = useState({});
  // Track per-card cart loading so the button shows spinner individually
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    dispatch(getAllWishlist());
    if (isLoggedIn) dispatch(getCart());
  }, [dispatch, isLoggedIn]);

  // ── Search filter ────────────────────────────────────────────────────────
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';

  const filteredWishlist = wishlistData.filter((item) => {
    if (!searchQuery) return true;
    const book = item.book || {};
    const title = book.title || '';
    const author = book.author || '';
    const category = book.category?.category_name || book.category || '';
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isBookInCart = (bookId) =>
    cartData.some((item) => {
      const cartBookId =
        item.book && typeof item.book === 'object' ? item.book._id : item.book;
      return cartBookId === bookId;
    });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDelete = async (wishlistId) => {
    if (window.confirm('Are you sure you want to remove this book from your wishlist?')) {
      await dispatch(deleteWishlistItem(wishlistId));
    }
  };

  const handleStatusChange = async (wishlistId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [wishlistId]: true }));
    await dispatch(updateWishlistStatus({ wishlistId, status: newStatus }));
    setUpdatingStatus((prev) => ({ ...prev, [wishlistId]: false }));
  };

  const handleAddToCart = async (book) => {
    if (!book?._id) return;

    // Already in cart — no duplicate
    if (isBookInCart(book._id)) {
      toast.error('Item is already in your cart');
      return;
    }

    if (isLoggedIn) {
      setAddingToCart((prev) => ({ ...prev, [book._id]: true }));
      try {
        await toast.promise(dispatch(addToCart(book._id)).unwrap(), {
          loading: 'Adding to cart...',
          success: 'Added to cart successfully!',
          error: 'Failed to add item to cart.',
        });
        // Refresh cart so isBookInCart reflects the new state
        dispatch(getCart());
      } finally {
        setAddingToCart((prev) => ({ ...prev, [book._id]: false }));
      }
    } else {
      // Guest user — use synchronous reducer
      dispatch(addToGuestCart(book));
      toast.success('Added to guest cart!');
    }
  };

  // ── Style helpers ────────────────────────────────────────────────────────
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'TO_READ':   return 'bg-[#ebeef4] text-[#404849]';
      case 'READING':   return 'bg-[#cce8e7] text-[#506969]';
      case 'COMPLETED': return 'bg-[#d4f4dd] text-[#1e4620]';
      default:          return 'bg-[#ebeef4] text-[#404849]';
    }
  };

  const formatStatus = (status) => status.replace('_', ' ');
  const formatPrice  = (price) => (price ? `₹${price}` : 'N/A');

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#002629] border-r-transparent" />
          <p className="mt-4 text-[#404849] font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="flex-grow pt-20 md:pt-28 pb-20 md:pb-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full font-['Inter'] antialiased">

      {/* Header */}
      <header className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight font-['Manrope'] text-[#002629] mb-2 md:mb-3">
            Your Wishlist
          </h1>
          <p className="text-[#404849] font-medium text-sm md:text-base lg:text-lg">
            You have{' '}
            <span className="text-[#002629] font-bold">
              {wishlistData.length} {wishlistData.length === 1 ? 'item' : 'items'}
            </span>{' '}
            waiting to be read.
          </p>
        </div>
        {wishlistData.length > 0 && (
          <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-[#e5e8ee] text-[#181c20] font-semibold hover:bg-[#dfe3e8] transition-colors text-xs md:text-sm active:scale-[0.98]">
            <span className="material-symbols-outlined !text-[16px] md:!text-[18px] leading-none">share</span>
            Share List
          </button>
        )}
      </header>

      {/* Empty state */}
      {wishlistData.length === 0 ? (
        <div className="text-center py-12 md:py-20">
          <div className="mb-4 md:mb-6">
            <span className="material-symbols-outlined text-[60px] md:text-[80px] text-[#c0c8c9]">book</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#002629] mb-2 md:mb-3 font-['Manrope']">
            Your wishlist is empty
          </h2>
          <p className="text-[#404849] mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4">
            Start adding books you'd like to read. Browse our collection to discover your next favourite.
          </p>
          <a
            href="/books"
            className="inline-block px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-[#002629] to-[#083d41] text-white rounded-lg font-semibold hover:opacity-95 transition-opacity no-underline text-sm md:text-base"
          >
            Browse Books
          </a>
        </div>

      ) : filteredWishlist.length === 0 ? (
        <div className="text-center py-12 md:py-20">
          <div className="mb-4 md:mb-6">
            <span className="material-symbols-outlined text-[60px] md:text-[80px] text-[#c0c8c9]">search_off</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#002629] mb-2 md:mb-3 font-['Manrope']">
            No matching books found
          </h2>
          <p className="text-[#404849] mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4">
            We couldn't find any books matching "{searchQuery}".
          </p>
        </div>

      ) : (
        <>
          {/* Wishlist Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {filteredWishlist.map((item) => {
              const book           = item.book || {};
              const alreadyInCart  = isBookInCart(book._id);
              const isAddingNow    = addingToCart[book._id];

              return (
                <div
                  key={item._id}
                  className="group bg-white rounded-xl overflow-hidden flex flex-col shadow-[0_4px_24px_rgba(24,28,32,0.04)] hover:shadow-[0_12px_40px_rgba(24,28,32,0.08)] transition-all duration-300"
                >
                  {/* Cover */}
                  <div className="aspect-[3/4] overflow-hidden relative bg-[#ebeef4]">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={book.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'}
                      alt={book.title || 'Book cover'}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                    {/* Delete overlay */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white transition-all duration-200 shadow-sm active:scale-95"
                      >
                        <span className="material-symbols-outlined !text-[18px] leading-none">delete</span>
                      </button>
                    </div>
                    {/* "In Cart" badge */}
                    {alreadyInCart && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#002629] text-white text-[9px] font-bold uppercase tracking-wider shadow">
                          <span className="material-symbols-outlined !text-[11px] leading-none">check_circle</span>
                          In Cart
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Book info & actions */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="min-h-[44px] mb-4">
                      <h3 className="text-base font-bold text-[#002629] font-['Manrope'] mb-0.5 line-clamp-1">
                        {book.title || 'Untitled'}
                      </h3>
                      <p className="text-[#404849] text-xs font-medium">{book.author || 'Unknown Author'}</p>
                    </div>

                    <div className="mt-auto">
                      {/* Price + status row */}
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <span className="text-base md:text-lg font-extrabold text-[#002629]">
                          {formatPrice(book.price)}
                        </span>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          disabled={updatingStatus[item._id]}
                          className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 md:px-2 py-0.5 rounded ${getStatusBadgeStyle(item.status)} border-none outline-none cursor-pointer disabled:opacity-50`}
                        >
                          <option value="TO_READ">To Read</option>
                          <option value="READING">Reading</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>

                      {/* View Details */}
                      <button
                        onClick={() => navigate(`/books/${book._id}`)}
                        className="w-full py-2 md:py-2.5 bg-[#002629] text-white rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 md:gap-2 transition-all hover:bg-[#083d41] active:scale-[0.98] mb-1.5 md:mb-2"
                      >
                        <span className="material-symbols-outlined !text-[16px] md:!text-[18px] leading-none">visibility</span>
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </button>

                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(book)}
                        disabled={alreadyInCart || isAddingNow}
                        className={`w-full py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 md:gap-2 transition-all active:scale-[0.98]
                          ${alreadyInCart
                            ? 'bg-[#ebeef4] text-[#404849] cursor-not-allowed'
                            : 'bg-[#002629] text-white hover:bg-[#083d41]'
                          }`}
                      >
                        {isAddingNow ? (
                          <>
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
                            <span className="hidden sm:inline">Adding...</span>
                          </>
                        ) : alreadyInCart ? (
                          <>
                            <span className="material-symbols-outlined !text-[16px] md:!text-[18px] leading-none">check</span>
                            <span className="hidden sm:inline">In Cart</span>
                            <span className="sm:hidden">Added</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined !text-[16px] md:!text-[18px] leading-none">add_shopping_cart</span>
                            <span className="hidden sm:inline">Add to Cart</span>
                            <span className="sm:hidden">Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Curation Recommendations */}
          <section className="mt-12 md:mt-16 lg:mt-24">
            <h2 className="text-2xl md:text-3xl font-extrabold font-['Manrope'] text-[#002629] mb-6 md:mb-8 tracking-tight">
              Curation Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

              {/* Editorial Spotlight */}
              <div className="md:col-span-2 bg-[#083d41] rounded-xl p-6 md:p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden min-h-[240px] md:min-h-[280px]">
                <div className="relative z-10 max-w-md">
                  <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-bold font-['Manrope'] mb-2 md:mb-3 leading-tight">
                    Based on your wishlist, you'll love our Fall Collection.
                  </h3>
                  <p className="text-[#7aa8ac] text-sm md:text-base mb-4 md:mb-6 font-medium">
                    Curated by our expert librarians to match your interest in contemporary fiction and technology.
                  </p>
                  <a
                    href="/books"
                    className="inline-flex px-4 md:px-6 py-2 md:py-2.5 bg-[#f7f9ff] text-[#002629] font-bold rounded-full items-center gap-2 text-xs md:text-sm hover:scale-[1.03] transition-transform active:scale-95 no-underline"
                  >
                    Explore Collection
                    <span className="material-symbols-outlined !text-[16px] md:!text-[18px] leading-none">arrow_forward</span>
                  </a>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 pointer-events-none hidden md:block">
                  <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600"
                    alt=""
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Membership Promo */}
              <div className="bg-[#e5e8ee] rounded-xl p-6 md:p-8 flex flex-col items-center text-center justify-center border border-[#c0c8c9]/10">
                <span className="material-symbols-outlined !text-[36px] md:!text-[44px] text-[#002629] mb-2 md:mb-3 leading-none">loyalty</span>
                <h3 className="text-lg md:text-xl font-bold font-['Manrope'] text-[#002629] mb-1 md:mb-1.5">
                  Member Discount
                </h3>
                <p className="text-[#404849] text-xs font-medium max-w-[240px] mb-4 md:mb-5 leading-relaxed">
                  Unlock 15% off these wishlist items by joining our premium circle today.
                </p>
                <button className="text-[#002629] text-xs font-bold uppercase tracking-wider border-b-2 border-[#002629] pb-0.5 hover:opacity-80 transition-opacity">
                  Learn More
                </button>
              </div>

            </div>
          </section>
        </>
      )}
    </main>
  );
}