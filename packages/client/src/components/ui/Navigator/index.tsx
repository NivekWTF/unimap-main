import { FC } from 'react';

type NavigatorProps = {
  size: number;
};

const Navigator: FC<NavigatorProps> = ({ size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 248 248"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_306_5)">
        <circle
          cx="124"
          cy="120"
          r="110"
          fill="url(#paint0_linear_306_5)"
          stroke="white"
          stroke-width="20"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_306_5"
          x="0"
          y="0"
          width="248"
          height="248"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_306_5"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_306_5"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_306_5"
          x1="124"
          y1="20"
          x2="124"
          y2="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#358CBD" />
          <stop offset="0.9999" stop-color="#2F7EAA" />
          <stop offset="1" stop-color="#184157" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Navigator;
