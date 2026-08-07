type KakaoIconProps = {
  className?: string;
};

export function KakaoIcon({ className }: KakaoIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#FEE500"
        d="M12 2C6.48 2 2 5.58 2 10c0 2.78 1.85 5.23 4.66 6.64-.2.75-.73 2.71-.84 3.13-.13.53.19.52.4.38.17-.11 2.68-1.82 3.77-2.56.65.09 1.32.14 2.01.14 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
      />
    </svg>
  );
}
