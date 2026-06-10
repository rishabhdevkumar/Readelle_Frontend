import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllWishlist, deleteWishlistItem, updateWishlistStatus } from '../redux/slices/wishlistSlice';

export default function WishlistContent() {
  const dispatch = useDispatch();
  const { wishlistData, isLoading } = useSelector((state) => state.wishlist);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    dispatch(getAllWishlist());
  }, [dispatch]);

  const handleDelete = async (wishlistId) => {
    if (window.confirm('Are you sure you want to remove this book from your wishlist?')) {
      await dispatch(deleteWishlistItem(wishlistId));
    }
  };

  const handleStatusChange = async (wishlistId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [wishlistId]: true }));
    await dispatch(updateWishlistStatus({ wishlistId, status: newStatus }));
    setUpdatingStatus(prev => ({ ...prev, [wishlistId]: false }));
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'TO_READ':
        return 'bg-[#ebeef4] text-[#404849]';
      case 'READING':
        return 'bg-[#cce8e7] text-[#506969]';
      case 'COMPLETED':
        return 'bg-[#d4f4dd] text-[#1e4620]';
      default:
        return 'bg-[#ebeef4] text-[#404849]';
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ');
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `₹${price}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#002629] border-r-transparent"></div>
          <p className="mt-4 text-[#404849] font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow pt-32 pb-24 px-8 max-w-7xl mx-auto w-full font-['Inter'] antialiased">
      
      {/* 1. Header Section */}
      <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight font-['Manrope'] text-[#002629] mb-3">
            Your Wishlist
          </h1>
          <p className="text-[#404849] font-medium text-lg">
            You have <span className="text-[#002629] font-bold">{wishlistData.length} {wishlistData.length === 1 ? 'item' : 'items'}</span> waiting to be read.
          </p>
        </div>
        {wishlistData.length > 0 && (
          <div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e5e8ee] text-[#181c20] font-semibold hover:bg-[#dfe3e8] transition-colors text-sm active:scale-[0.98]">
              <span className="material-symbols-outlined !text-[18px] leading-none">share</span>
              <span>Share List</span>
            </button>
          </div>
        )}
      </header>

      {/* Empty State */}
      {wishlistData.length === 0 ? (
        <div className="text-center py-20">
          <div className="mb-6">
            <span className="material-symbols-outlined text-[80px] text-[#c0c8c9]">book</span>
          </div>
          <h2 className="text-2xl font-bold text-[#002629] mb-3 font-['Manrope']">Your wishlist is empty</h2>
          <p className="text-[#404849] mb-8 max-w-md mx-auto">
            Start adding books you'd like to read to your wishlist. Browse our collection to discover your next favorite book.
          </p>
          <a
            href="/books"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#002629] to-[#083d41] text-white rounded-lg font-semibold hover:opacity-95 transition-opacity no-underline"
          >
            Browse Books
          </a>
        </div>
      ) : (
        <>
          {/* 2. Wishlist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistData.map((item) => {
              const book = item.book || {};
              return (
                <div 
                  key={item._id} 
                  className="group bg-white rounded-xl overflow-hidden flex flex-col shadow-[0_4px_24px_rgba(24,28,32,0.04)] hover:shadow-[0_12px_40px_rgba(24,28,32,0.08)] transition-all duration-300"
                >
                  {/* Cover Image Container */}
                  <div className="aspect-[3/4] overflow-hidden relative bg-[#ebeef4]">
                    <img 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src={book.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'} 
                      alt={book.title || 'Book cover'}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                    {/* Delete Icon Overlay */}
                    <div className="absolute top-3 right-3 z-10">
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white transition-all duration-200 shadow-sm active:scale-95"
                      >
                        <span className="material-symbols-outlined !text-[18px] leading-none">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Book Info & CTA Details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="min-h-[44px] mb-4">
                      <h3 className="text-base font-bold text-[#002629] font-['Manrope'] mb-0.5 line-clamp-1">
                        {book.title || 'Untitled'}
                      </h3>
                      <p className="text-[#404849] text-xs font-medium">{book.author || 'Unknown Author'}</p>
                    </div>
                    
                    <div className="mt-auto">
                      {/* Price and Status Row */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-extrabold text-[#002629]">{formatPrice(book.price)}</span>
                        
                        {/* Status Dropdown */}
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          disabled={updatingStatus[item._id]}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getStatusBadgeStyle(item.status)} border-none outline-none cursor-pointer disabled:opacity-50`}
                        >
                          <option value="TO_READ">To Read</option>
                          <option value="READING">Reading</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                      
                      {/* View Details Button */}
                      <button 
                        onClick={() => window.location.href = `/books/${book._id}`}
                        className="w-full py-2.5 bg-[#002629] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#083d41] active:scale-[0.98] mb-2"
                      >
                        <span className="material-symbols-outlined !text-[18px] leading-none">visibility</span>
                        <span>View Details</span>
                      </button>

                      {/* Add to Cart Button */}
                      <button 
                        onClick={() => {
                          // TODO: Implement add to cart functionality
                          console.log('Add to cart:', book._id);
                        }}
                        className="w-full py-2.5 bg-[#002629] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#083d41] active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined !text-[18px] leading-none">add_shopping_cart</span>
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Curation Recommendations (Asymmetric Bento Style) */}
          <section className="mt-24">
            <h2 className="text-3xl font-extrabold font-['Manrope'] text-[#002629] mb-8 tracking-tight">
              Curation Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Bento Grid Panel 1: Editorial Spotlight */}
              <div className="md:col-span-2 bg-[#083d41] rounded-xl p-10 flex flex-col justify-center relative overflow-hidden min-h-[280px]">
                <div className="relative z-10 max-w-md">
                  <h3 className="text-white text-3xl font-bold font-['Manrope'] mb-3 leading-tight">
                    Based on your wishlist, you'll love our Fall Collection.
                  </h3>
                  <p className="text-[#7aa8ac] text-base mb-6 font-medium">
                    Curated by our expert librarians to match your interest in contemporary fiction and technology.
                  </p>
                  <a
                    href="/books"
                    className="inline-flex px-6 py-2.5 bg-[#f7f9ff] text-[#002629] font-bold rounded-full items-center gap-2 text-sm hover:scale-[1.03] transition-transform active:scale-95 no-underline"
                  >
                    <span>Explore Collection</span>
                    <span className="material-symbols-outlined !text-[18px] leading-none">arrow_forward</span>
                  </a>
                </div>
                {/* Background Image Accent */}
                <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 pointer-events-none hidden sm:block">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600" 
                    alt="Decorative layered books"
                  />
                </div>
              </div>

              {/* Bento Grid Panel 2: Membership Promo */}
              <div className="bg-[#e5e8ee] rounded-xl p-8 flex flex-col items-center text-center justify-center border border-[#c0c8c9]/10">
                <span className="material-symbols-outlined !text-[44px] text-[#002629] mb-3 leading-none">loyalty</span>
                <h3 className="text-xl font-bold font-['Manrope'] text-[#002629] mb-1.5">
                  Member Discount
                </h3>
                <p className="text-[#404849] text-xs font-medium max-w-[240px] mb-5 leading-relaxed">
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