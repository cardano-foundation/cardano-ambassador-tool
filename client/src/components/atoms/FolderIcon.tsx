
import React from 'react';

type FolderIconProps = {
  className?: string;
  width?: number;
  height?: number;
};

export default function FolderIcon({
  className,
  width = 80,
  height = 80,
}: FolderIconProps) {
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <g transform="translate(6, 13.73) scale(0.98, 0.8)">
          <path
            d="M61.4819 0.733124H2.97664C2.18734 0.733612 1.4305 1.04738 0.872377 1.6055C0.314255 2.16362 0.000488582 2.92046 0 3.70976V57.3889C0.000488582 58.1782 0.314255 58.935 0.872377 59.4931C1.4305 60.0512 2.18734 60.365 2.97664 60.3655H61.4819C62.2712 60.3651 63.0281 60.0514 63.5863 59.4932C64.1445 58.9351 64.4583 58.1782 64.4588 57.3889V3.70976C64.4583 2.92041 64.1445 2.16352 63.5863 1.60539C63.0281 1.04726 62.2712 0.733531 61.4819 0.733124Z"
            fill="#C6C6C6"
            className="dark:fill-white-100"
          />
        </g>
        <g transform="translate(9.85, 1.33) scale(0.82, 0.96)">
          <path
            d="M54.6299 53.7123H3.8282C2.18435 53.7123 0.851562 52.3796 0.851562 50.7357V3.30742C0.851562 1.66357 2.18435 0.33078 3.8282 0.33078H54.6299C56.2738 0.33078 57.6066 1.66357 57.6066 3.30742V50.7357C57.6066 52.3796 56.2738 53.7123 54.6299 53.7123Z"
            fill="#F9F9F9"
            className="dark:fill-white-300"
          />
        </g>
        <g transform="translate(9.85, 1.33) scale(0.82, 0.96)">
          <defs>
            <linearGradient id="paint0_linear_light" x1="30.9745" y1="28.7638" x2="-6.66995" y2="-8.88101" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" className="dark:stop-color-gray-500" />
            </linearGradient>
          </defs>
          <path
            d="M1.79398 51.6778V4.24984C1.79398 2.60598 3.12677 1.2732 4.77062 1.2732H55.5724C56.153 1.2732 56.6928 1.44195 57.1504 1.72935C56.6242 0.890206 55.6935 0.33078 54.6299 0.33078H3.8282C2.18435 0.33078 0.851562 1.66357 0.851562 3.30742V50.7357C0.851562 51.7995 1.41099 52.73 2.25013 53.2565C1.96273 52.7985 1.79398 52.2588 1.79398 51.6781V51.6778Z"
            fill="url(#paint0_linear_light)"
            className="dark:fill-gray-200"
          />
        </g>

        <g transform="translate(19.08, 11.35) scale(0.72, 0.82)">
          <path
            d="M38.3792 0.351654H0.0791016V2.53434H38.3792V0.351654ZM38.3792 8.68587H0.0791016V10.8686H38.3792V8.68587ZM38.3792 17.0219H0.0791016V19.2046H38.3792V17.0219ZM38.3792 25.3562H0.0791016V27.5392H38.3792V25.3562Z"
            fill="white"
            className="dark:fill-gray-400"
          />
        </g>
        <g transform="translate(23.64, 29.31) scale(0.91, 0.91)">
          <defs>
            <linearGradient id="paint1_linear_light" x1="7.00227" y1="11.4799" x2="-4.63103" y2="-0.153078" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C2CECE" stopOpacity="0"/>
              <stop offset="0.179" stopColor="#AFBCBC" stopOpacity="0.179"/>
              <stop offset="1" stopColor="#5B6A6A"/>
            </linearGradient>
          </defs>
          <path
            d="M0.643555 0.311066L10.2678 9.93565H0.643555V0.311066Z"
            fill="url(#paint1_linear_light)"
          />
        </g>

        <g transform="translate(0, 28.02) scale(1.0, 0.95)">
                  <defs>
                    <linearGradient id="paint2_linear_light" x1="37.5" y1="0.0211182" x2="37.5" y2="45.6694" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#EEF0F4" className="dark:stop-color-gray-700"/>
                      <stop offset="0.927" stopColor="#E4E4E4" className="dark:stop-color-gray-800"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M74.9702 13.7326L70.8203 43.1092C70.6128 44.5779 69.3559 45.6694 67.8728 45.6694H8.58532C7.10222 45.6694 5.84536 44.5779 5.63788 43.1092L0.0297861 3.41425C-0.223185 1.62224 1.16739 0.0211182 2.97722 0.0211182H21.2864C22.7695 0.0211182 24.0264 1.11261 24.2339 2.58095L24.9688 7.77931C25.1763 9.24796 26.4332 10.3395 27.9163 10.3395H72.0233C73.8326 10.3395 75.2234 11.9406 74.9705 13.7326H74.9702Z"
                    fill="url(#paint2_linear_light)"
                    className="dark:fill-[#888989]"
                  />
                </g>

                <g transform="translate(14.65, 54.22) scale(1.2, 1.0)">
                  <path
                    d="M46.2666 6.5662H2.19212C1.95054 6.56611 1.71728 6.47793 1.53604 6.3182C1.35481 6.15846 1.23803 5.93813 1.20759 5.69847L0.656157 1.33249C0.638638 1.19282 0.651018 1.05102 0.692478 0.916502C0.733937 0.781982 0.803528 0.657821 0.896632 0.552246C0.989736 0.446672 1.10423 0.362098 1.23251 0.304144C1.36079 0.24619 1.49992 0.216177 1.64069 0.216095H46.818C46.9588 0.216177 47.0979 0.24619 47.2262 0.304144C47.3545 0.362098 47.469 0.446672 47.5621 0.552246C47.6552 0.657821 47.7248 0.781982 47.7662 0.916502C47.8077 1.05102 47.8201 1.19282 47.8026 1.33249L47.2511 5.69847C47.2207 5.93813 47.1039 6.15846 46.9227 6.3182C46.7414 6.47793 46.5082 6.56611 46.2666 6.5662Z"
                    fill="#D5D5D5"
                    className="dark:fill-white-[#B7B8B8]"
                  />
                </g>

                {/* Star detail - simplified and positioned */}
                <g transform="translate(34.5, 4) scale(0.6, 0.6)">
                  <polygon
                    points="5,0 6,3.5 9.5,3.5 7,5.5 8,9 5,7 2,9 3,5.5 0.5,3.5 4,3.5"
                    fill="#9CA3AF"
                    opacity="0.4"
                    className="dark:fill-gray-500"
                  />
                </g>
      </svg>
    </div>
  );
}