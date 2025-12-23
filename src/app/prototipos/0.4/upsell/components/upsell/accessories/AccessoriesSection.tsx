'use client';

import React, { useState } from 'react';
import type { Accessory, UpsellConfig } from '../../../types/upsell';

// Import all intro versions
import AccessoryIntroV1 from './intro/AccessoryIntroV1';
import AccessoryIntroV2 from './intro/AccessoryIntroV2';
import AccessoryIntroV3 from './intro/AccessoryIntroV3';
import AccessoryIntroV4 from './intro/AccessoryIntroV4';
import AccessoryIntroV5 from './intro/AccessoryIntroV5';
import AccessoryIntroV6 from './intro/AccessoryIntroV6';

// Import all card versions
import AccessoryCardV1 from './cards/AccessoryCardV1';
import AccessoryCardV2 from './cards/AccessoryCardV2';
import AccessoryCardV3 from './cards/AccessoryCardV3';
import AccessoryCardV4 from './cards/AccessoryCardV4';
import AccessoryCardV5 from './cards/AccessoryCardV5';
import AccessoryCardV6 from './cards/AccessoryCardV6';

// Import all limit versions
import AccessoryLimitV1 from './limit/AccessoryLimitV1';
import AccessoryLimitV2 from './limit/AccessoryLimitV2';
import AccessoryLimitV3 from './limit/AccessoryLimitV3';
import AccessoryLimitV4 from './limit/AccessoryLimitV4';
import AccessoryLimitV5 from './limit/AccessoryLimitV5';
import AccessoryLimitV6 from './limit/AccessoryLimitV6';

// Import price breakdown versions
import PriceBreakdownV1 from './breakdown/PriceBreakdownV1';
import PriceBreakdownV2 from './breakdown/PriceBreakdownV2';
import PriceBreakdownV3 from './breakdown/PriceBreakdownV3';
import PriceBreakdownV4 from './breakdown/PriceBreakdownV4';
import PriceBreakdownV5 from './breakdown/PriceBreakdownV5';
import PriceBreakdownV6 from './breakdown/PriceBreakdownV6';

interface AccessoriesSectionProps {
  accessories: Accessory[];
  selectedAccessoryIds: string[];
  onToggleAccessory: (id: string) => void;
  config: UpsellConfig;
  productPrice: number;
  maxAccessories?: number;
  className?: string;
}

/**
 * AccessoriesSection - Main wrapper for accessories upsell
 * Orchestrates all accessory-related components based on config
 */
export const AccessoriesSection: React.FC<AccessoriesSectionProps> = ({
  accessories,
  selectedAccessoryIds,
  onToggleAccessory,
  config,
  productPrice,
  maxAccessories = 3,
  className = '',
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Component maps
  const IntroComponents = {
    1: AccessoryIntroV1,
    2: AccessoryIntroV2,
    3: AccessoryIntroV3,
    4: AccessoryIntroV4,
    5: AccessoryIntroV5,
    6: AccessoryIntroV6,
  };

  const CardComponents = {
    1: AccessoryCardV1,
    2: AccessoryCardV2,
    3: AccessoryCardV3,
    4: AccessoryCardV4,
    5: AccessoryCardV5,
    6: AccessoryCardV6,
  };

  const LimitComponents = {
    1: AccessoryLimitV1,
    2: AccessoryLimitV2,
    3: AccessoryLimitV3,
    4: AccessoryLimitV4,
    5: AccessoryLimitV5,
    6: AccessoryLimitV6,
  };

  const BreakdownComponents = {
    1: PriceBreakdownV1,
    2: PriceBreakdownV2,
    3: PriceBreakdownV3,
    4: PriceBreakdownV4,
    5: PriceBreakdownV5,
    6: PriceBreakdownV6,
  };

  const IntroComponent = IntroComponents[config.accessoryIntroVersion];
  const CardComponent = CardComponents[config.accessoryCardVersion];
  const LimitComponent = LimitComponents[config.accessoryLimitVersion];
  const BreakdownComponent = BreakdownComponents[config.priceBreakdownVersion];

  const selectedAccessories = accessories.filter(acc =>
    selectedAccessoryIds.includes(acc.id)
  );

  const accessoriesTotal = selectedAccessories.reduce(
    (sum, acc) => sum + acc.price,
    0
  );

  const accessoriesMonthlyTotal = selectedAccessories.reduce(
    (sum, acc) => sum + acc.monthlyQuota,
    0
  );

  const isAtLimit = selectedAccessoryIds.length >= maxAccessories;

  // Determine grid layout based on card version
  const getGridClasses = () => {
    switch (config.accessoryCardVersion) {
      case 2: // Variable size
        return 'grid grid-cols-3 gap-4';
      case 4: // Carousel
        return 'flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4';
      case 5: // Featured + grid
        return 'space-y-4';
      case 6: // Giant cards
        return 'space-y-4';
      default:
        return 'grid grid-cols-3 gap-4';
    }
  };

  return (
    <section className={`${className}`}>
      {/* Intro */}
      <IntroComponent />

      {/* Limit indicator */}
      <LimitComponent
        selected={selectedAccessoryIds.length}
        max={maxAccessories}
      />

      {/* Cards */}
      <div className={getGridClasses()}>
        {config.accessoryCardVersion === 5 ? (
          // Featured + grid layout for V5
          <>
            {accessories[0] && (
              <CardComponent
                accessory={accessories[0]}
                isSelected={selectedAccessoryIds.includes(accessories[0].id)}
                onToggle={() => onToggleAccessory(accessories[0].id)}
                isFeatured={true}
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              {accessories.slice(1).map((accessory) => (
                <CardComponent
                  key={accessory.id}
                  accessory={accessory}
                  isSelected={selectedAccessoryIds.includes(accessory.id)}
                  onToggle={() => onToggleAccessory(accessory.id)}
                  isFeatured={false}
                />
              ))}
            </div>
          </>
        ) : (
          // Standard grid/carousel for other versions
          accessories.map((accessory) => (
            <CardComponent
              key={accessory.id}
              accessory={accessory}
              isSelected={selectedAccessoryIds.includes(accessory.id)}
              onToggle={() => onToggleAccessory(accessory.id)}
            />
          ))
        )}
      </div>

      {/* Price breakdown */}
      <BreakdownComponent
        productPrice={productPrice}
        productQuota={0}
        accessories={accessories}
        selectedAccessoryIds={selectedAccessoryIds}
        insurancePlan={null}
      />
    </section>
  );
};

export default AccessoriesSection;
