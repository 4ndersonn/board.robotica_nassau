import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly label: string;
  readonly children: ReactNode;
}

export function IconButton({
  label,
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const composedClassName = [styles.iconButton, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={composedClassName}
      {...rest}
    >
      {children}
    </button>
  );
}
