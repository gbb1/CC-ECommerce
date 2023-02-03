import React, { useState, useEffect, useRef } from 'react';
import ReviewsSortMenu from './ReviewsSortMenu';
import ReviewsCardList from './ReviewsCardList';
import ReviewModal from '../modals/ReviewModal';

export default function ReviewsList({
  productReviews, starFilter, handleSortClick, sortBy, reviewMetaData, setRerender, productName
}) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const reviewListTopRef = useRef(null);

  return (
    <div className="reviews-list">
      <ReviewsSortMenu
        handleSortClick={handleSortClick}
        numReviews={productReviews.length}
        sortBy={sortBy}
        reviewListTopRef={reviewListTopRef}
      />
      <ReviewsCardList
        productReviews={productReviews}
        setShowReviewModal={setShowReviewModal}
        starFilter={starFilter}
        sortBy={sortBy}
        reviewListTopRef={reviewListTopRef}
        setRerender={setRerender}
      />
      {showReviewModal
      && (
        <ReviewModal
          setShowReviewModal={setShowReviewModal}
          reviewMetaData={reviewMetaData}
          setRerender={setRerender}
          productName={productName}
        />
      )}
    </div>
  );
}
