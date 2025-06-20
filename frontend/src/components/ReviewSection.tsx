import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User, Calendar, ShoppingBag, Filter, Edit2, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import type { Review, ReviewStats } from '../services/reviewsApi';

interface ReviewSectionProps {
  productId: string;
  productName: string;
  productPrice: number;
}

interface ReviewFilters {
  rating: number | 'all';
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>({
    rating: 'all',
    sortBy: 'newest'
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews(true);
  }, [productId, filters]);

  const loadReviews = async (reset = false) => {
    try {
      setLoading(reset);
      const currentPage = reset ? 1 : page;
      
              const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}?page=${currentPage}&limit=10&rating=${filters.rating}&sortBy=${filters.sortBy}`);
        const data = await response.json();

      if (data.success) {
        if (reset) {
          setReviews(data.data.reviews);
          setPage(1);
        } else {
          setReviews(prev => [...prev, ...data.data.reviews]);
        }
        setStats(data.data.stats);
        setHasMore(data.data.pagination.page < data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId,
          ...reviewForm
        })
      });

      const data = await response.json();
      if (data.success) {
        setReviewForm({ rating: 5, title: '', comment: '', images: [] });
        setShowReviewForm(false);
        loadReviews(true);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string, isHelpful: boolean) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isHelpful })
      });

      if (response.ok) {
        loadReviews(true);
      }
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  const handleEditReview = async (reviewId: string, reviewData: unknown) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();
      if (data.success) {
        setEditingReviewId(null);
        setReviewForm({ rating: 5, title: '', comment: '', images: [] });
        loadReviews(true);
      } else {
        alert(data.error || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        loadReviews(true);
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const startEditingReview = (review: Review) => {
    setEditingReviewId(review.id);
    setReviewForm({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || '',
      images: review.images || []
    });
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setReviewForm({ rating: 5, title: '', comment: '', images: [] });
  };

  const renderStars = (rating: number, size = 16) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = stats.distribution[rating as keyof typeof stats.distribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-sm">{rating}</span>
                <Star size={12} className="text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        
        {stats && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </span>
                <div>
                  {renderStars(Math.round(stats.averageRating), 20)}
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
              {renderRatingDistribution()}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value === 'all' ? 'all' : parseInt(e.target.value) }))}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        {/* Write Review Button */}
        {user && (
          <div className="mb-6">
            {reviews.some(review => review.userId === user.id) ? (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                You have already reviewed this product. You can edit or delete your review below.
              </p>
            ) : (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Write a Review
              </button>
            )}
          </div>
        )}

        {/* Review Form */}
        <AnimatePresence>
          {showReviewForm && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={24}
                          className={rating <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Summarize your experience"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Share your thoughts about this product..."
                  />
                </div>

                {/* Submit */}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-orange-300 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {loading && reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {review.user.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={`${review.user.firstName} ${review.user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(review.rating)}
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <ShoppingBag size={10} className="mr-1" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                      {/* Edit/Delete buttons for user's own reviews */}
                      {user && user.id === review.userId && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEditingReview(review)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded"
                            title="Edit review"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
                            title="Delete review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review content or edit form */}
                  {editingReviewId === review.id ? (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Edit Your Review</h5>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleEditReview(review.id, reviewForm);
                      }} className="space-y-4">
                        {/* Rating */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Rating
                          </label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map(rating => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  size={20}
                                  className={rating <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review Title (Optional)
                          </label>
                          <input
                            type="text"
                            value={reviewForm.title}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            placeholder="Summarize your experience"
                          />
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            placeholder="Share your thoughts about this product..."
                          />
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                          >
                            <Save size={14} />
                            <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                          >
                            <X size={14} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      {review.title && (
                        <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                      )}

                      {review.comment && (
                        <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                      )}

                      {review.images && review.images.length > 0 && (
                        <div className="flex space-x-2 mb-3">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Helpful buttons - only show when not editing */}
                  {editingReviewId !== review.id && (
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600">Was this helpful?</span>
                      <button
                        onClick={() => handleHelpfulVote(review.id, true)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
                        disabled={!user}
                      >
                        <ThumbsUp size={14} />
                        <span>Yes ({review.helpfulCount})</span>
                      </button>
                      <button
                        onClick={() => handleHelpfulVote(review.id, false)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                        disabled={!user}
                      >
                        <ThumbsDown size={14} />
                        <span>No</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Load More */}
        {hasMore && reviews.length > 0 && (
          <div className="text-center pt-6">
            <button
              onClick={() => {
                setPage(prev => prev + 1);
                loadReviews();
              }}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More Reviews'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection; 