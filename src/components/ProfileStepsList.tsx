import React from 'react';
import { CheckCircle, Circle } from '@mui/icons-material';
import { UserProfile } from '../types/user.ts';

interface ProfileStepsListProps {
  profile: UserProfile | undefined;
  favoriteArtworks: number[];
  favoriteGalleries: number[];
  className?: string;
}

interface Step {
  id: number;
  label: string;
  isComplete: boolean;
  description: string;
}

const ProfileStepsList: React.FC<ProfileStepsListProps> = ({
  profile,
  favoriteArtworks,
  favoriteGalleries,
  className = ""
}) => {
  const getSteps = (): Step[] => {
    if (!profile) {
      return [
        { id: 1, label: 'Completa i dati personali', isComplete: false, description: 'Nome e cognome' },
        { id: 2, label: 'Aggiungi gli indirizzi', isComplete: false, description: 'Fatturazione e spedizione' },
        { id: 3, label: 'Segui una galleria', isComplete: false, description: 'Trova gallerie interessanti' },
        { id: 4, label: 'Aggiungi un\'opera ai preferiti', isComplete: false, description: 'Salva le opere che ti piacciono' }
      ];
    }

    // Step 1: Personal data
    const isPersonalDataComplete =
      profile.first_name?.trim() !== '' &&
      profile.last_name?.trim() !== '';

    // Step 2: Addresses
    const isBillingComplete = profile.billing &&
      profile.billing.first_name?.trim() !== '' &&
      profile.billing.last_name?.trim() !== '' &&
      profile.billing.address_1?.trim() !== '' &&
      profile.billing.city?.trim() !== '' &&
      profile.billing.postcode?.trim() !== '' &&
      profile.billing.country?.trim() !== '' &&
      profile.billing.phone?.trim() !== '';

    const isShippingComplete = profile.shipping &&
      profile.shipping.first_name?.trim() !== '' &&
      profile.shipping.last_name?.trim() !== '' &&
      profile.shipping.address_1?.trim() !== '' &&
      profile.shipping.city?.trim() !== '' &&
      profile.shipping.postcode?.trim() !== '' &&
      profile.shipping.country?.trim() !== '' &&
      profile.shipping.phone?.trim() !== '';

    const areAddressesComplete = isBillingComplete && (profile.billing.same_as_shipping || isShippingComplete);

    // Step 3 & 4: Favorites
    const hasFollowedGallery = favoriteGalleries.length > 0;
    const hasFavoriteArtwork = favoriteArtworks.length > 0;

    return [
      {
        id: 1,
        label: 'Completa i dati personali',
        isComplete: isPersonalDataComplete,
        description: 'Nome e cognome'
      },
      {
        id: 2,
        label: 'Aggiungi gli indirizzi',
        isComplete: areAddressesComplete,
        description: 'Fatturazione e spedizione'
      },
      {
        id: 3,
        label: 'Segui una galleria',
        isComplete: hasFollowedGallery,
        description: 'Trova gallerie interessanti'
      },
      {
        id: 4,
        label: 'Aggiungi un\'opera ai preferiti',
        isComplete: hasFavoriteArtwork,
        description: 'Salva le opere che ti piacciono'
      }
    ];
  };

  const steps = getSteps();

  return (
    <div className={` ${className}`}>

      <ul className="space-y-3">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-start gap-3 transition-opacity duration-300"
            style={{ opacity: step.isComplete ? 0.5 : 1 }}
          >
            <div className="flex-shrink-0 mt-0.5">
              {step.isComplete ? (
                <CheckCircle className="text-primary" sx={{ fontSize: 20 }} />
              ) : (
                <Circle className="text-gray-300" sx={{ fontSize: 20 }} />
              )}
            </div>
            <div className="">
              <p
                className={`text-sm font-medium ${
                  step.isComplete ? 'line-through text-gray-400' : 'text-secondary'
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileStepsList;