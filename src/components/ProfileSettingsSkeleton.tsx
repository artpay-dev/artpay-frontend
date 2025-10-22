import React from "react";
import PersonalDataRowSkeleton from "./PersonalDataRowSkeleton";
import ShippingDataRowSkeleton from "./ShippingDataRowSkeleton";
import BillingDataRowSkeleton from "./BillingDataRowSkeleton";

interface NewProfileSettingsSkeletonProps {
  showBillingSection?: boolean;
}

const ProfileSettingsSkeleton: React.FC<NewProfileSettingsSkeletonProps> = ({
  showBillingSection = false,
}) => {
  return (
    <section className="space-y-12 mb-24">
      {/* Personal data row skeleton */}
      <PersonalDataRowSkeleton />
      
      {/* Shipping data row skeleton */}
      <ShippingDataRowSkeleton />
      
      {/* Billing data row skeleton (conditional) */}
      {showBillingSection && <BillingDataRowSkeleton />}
    </section>
  );
};

export default ProfileSettingsSkeleton;