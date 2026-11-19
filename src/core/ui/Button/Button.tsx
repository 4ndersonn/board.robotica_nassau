import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'secondary'
  | 'activeSelection'
  | 'activeConfirm'
  | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly children: ReactNode;
}

export function Button({
  variant = 'secondary',
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const composedClassName = [
    styles.button,
    styles[variant],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={composedClassName}
      {...rest}
    >
      {children}
    </button>
  );
}
