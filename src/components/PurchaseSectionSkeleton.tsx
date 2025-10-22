import React from "react";
import LoanBookingSkeleton from "./LoanBookingSkeleton";
import PaymentCardSkeleton from "./PaymentCardSkeleton";
import ShippingMethodSkeleton from "./ShippingMethodSkeleton";
import ContactInfoSkeleton from "./ContactInfoSkeleton";
import OrderDetailsSkeleton from "./OrderDetailsSkeleton.tsx";

interface PurchaseSectionSkeletonProps {
  showLoanSection?: boolean;
  showShippingSection?: boolean;
}

const PurchaseSectionSkeleton: React.FC<PurchaseSectionSkeletonProps> = ({
  showLoanSection = true,
  showShippingSection = true,
}) => {
  return (
    <div className="flex flex-col md:grid lg:grid-cols-2 gap-8 md:gap-32 pb-24 pt-35 md:pt-0">
      <div className="order-last lg:order-first">
        {/* Loan booking section skeleton */}
        {showLoanSection && <LoanBookingSkeleton />}
        
        {/* Payment card skeleton */}
        <PaymentCardSkeleton />
        
        {/* Shipping method skeleton */}
        {showShippingSection && <ShippingMethodSkeleton />}
        
        {/* Contact information skeleton */}
        <ContactInfoSkeleton />
      </div>
      <OrderDetailsSkeleton />
    </div>
  );
};

export default PurchaseSectionSkeleton;