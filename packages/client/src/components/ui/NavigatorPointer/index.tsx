import { FC } from 'react';

type NavigatorProps = {
  size: number;
};

const NavigatorPointer: FC<NavigatorProps> = ({ size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 70 61"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M34.9719 61L0.373041 0.975691L69.6551 1.02433L34.9719 61Z"
        fill="white"
      />
    </svg>
  );
};

export default NavigatorPointer;
