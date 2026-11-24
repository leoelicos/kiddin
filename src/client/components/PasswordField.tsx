import { useState, type InputHTMLAttributes } from 'react';
import { Field } from './Field.tsx';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string | undefined;
};

/**
 * Password input with a show/hide toggle. Paste and password managers are
 * always allowed (WCAG 2.2 SC 3.3.8 Accessible Authentication).
 */
export function PasswordField({ label, hint, error, id, ...rest }: Props) {
  const [shown, setShown] = useState(false);
  return (
    <Field
      {...rest}
      id={id}
      label={label}
      hint={hint}
      error={error}
      type={shown ? 'text' : 'password'}
      spellCheck={false}
      autoCapitalize="off"
      suffix={
        <button
          type="button"
          className="field__suffix-btn"
          aria-pressed={shown}
          aria-controls={id}
          onClick={() => setShown((s) => !s)}
        >
          {shown ? 'Hide' : 'Show'} <span className="sr-only">password</span>
        </button>
      }
    />
  );
}
