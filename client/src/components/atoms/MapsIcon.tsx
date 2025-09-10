// MapsIcon.tsx - Map pin with embedded Cardano icon (Leaflet compatible)
import React from 'react';
import { CardanoIcon } from '@/components/atoms/CardanoIcon';

export interface MapsIconProps {
  size?: number;
  pinColor?: string;
  backgroundColor?: string;
  className?: string;
  cardanoIconColor?: string;
  cardanoIconSize?: number;
}

export const MapsIcon: React.FC<MapsIconProps> = ({ 
  size = 66, 
  pinColor = "white",
  backgroundColor = "#ef4444",
  className = "",
  cardanoIconSize = 30
}) => {
  const height = Math.round(size * (76/66));
  const scale = size / 66;
  
  const iconScale = (cardanoIconSize * scale) / 20; 
  const iconX = (33 - cardanoIconSize/2) * scale;
  const iconY = (29.9846 - cardanoIconSize/2) * scale;

  return (
    <svg 
      width={size} 
      height={height} 
      viewBox="0 0 66 76" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_d_605_1578)">
        <path d="M12 29.9846C12 18.3866 21.402 8.98462 33 8.98462C44.598 8.98462 54 18.3866 54 29.9846C54 41.5826 44.598 50.9846 33 50.9846C21.402 50.9846 12 41.5826 12 29.9846Z" fill={pinColor}/>
        <path d="M15 29.9846C15 20.0406 23.0594 11.9846 33 11.9846C42.9406 11.9846 51 20.0406 51 29.9846C51 39.9286 42.9406 47.9846 33 47.9846C23.0594 47.9846 15 39.9286 15 29.9846Z" fill={backgroundColor}/>
        <path d="M34.7321 58.9846C33.9623 60.318 32.0378 60.318 31.268 58.9846L26.0718 49.9846C25.302 48.6513 26.2642 46.9846 27.8038 46.9846H38.1961C39.7358 46.9846 40.698 48.6513 39.9282 49.9846L34.7321 58.9846Z" fill={pinColor}/>
      </g>
      <foreignObject 
        x={iconX} 
        y={iconY} 
        width={cardanoIconSize * scale} 
        height={cardanoIconSize * scale}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <CardanoIcon 
            size={40}
            color="#ffffff" 
          />
        </div>
      </foreignObject>
      
      <defs>
        <filter id="filter0_d_605_1578" x="0" y="0.984619" width="66" height="75" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="4"/>
          <feGaussianBlur stdDeviation="6"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.333333 0 0 0 0 0.329412 0 0 0 0.35 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_605_1578"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_605_1578" result="shape"/>
        </filter>
      </defs>
    </svg>
  );
};

export default MapsIcon;