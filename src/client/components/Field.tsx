import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import './Field.css';

interface BaseProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | undefined;
  /** Shown as "(optional)" — required is the default in Kiddin forms. */
  optional?: boolean;
  prefix?: string;
  counter?: { value: number; max: number };
  /** Extra control rendered inside the input wrapper (e.g. show/hide password). */
  suffix?: ReactNode;
}

type InputProps = BaseProps & { as?: 'input' } & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & { as: 'textarea' } & TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Labelled form control with programmatically-associated hint, error and
 * character counter (aria-describedby), and aria-invalid on error.
 */
export function Field(props: InputProps | TextareaProps) {
  const { label, hint, error, optional, prefix, counter, suffix, as, id: idProp, ...rest } = props;
  const autoId = useId();
  const id = idProp ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const counterId = counter ? `${id}-count` : undefined;
  const describedBy = [errorId, hintId, counterId].filter(Boolean).join(' ') || undefined;
  const nearLimit = counter && counter.value > counter.max * 0.85;

  const common = {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    required: !optional,
    className: 'field__control',
  } as const;

  return (
    <div className="field" data-invalid={error ? '' : undefined}>
      <label htmlFor={id} className="field__label">
        {label}
        {optional && (
          <>
            {' '}
            <span className="field__optional">(optional)</span>
          </>
        )}
      </label>
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <div
        className="field__wrap"
        data-prefix={prefix ? '' : undefined}
        data-suffix={suffix ? '' : undefined}
      >
        {prefix && (
          <span className="field__prefix" aria-hidden="true">
            {prefix}
          </span>
        )}
        {as === 'textarea' ? (
          <textarea {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} {...common} />
        ) : (
          <input {...(rest as InputHTMLAttributes<HTMLInputElement>)} {...common} />
        )}
        {suffix}
      </div>
      <div className="field__foot">
        {error ? (
          <p id={errorId} className="field__error">
            <span aria-hidden="true">⚠ </span>
            {error}
          </p>
        ) : (
          <span />
        )}
        {counter && (
          <p id={counterId} className="field__counter" data-near={nearLimit ? '' : undefined}>
            {counter.value}/{counter.max} <span className="sr-only">characters used</span>
          </p>
        )}
      </div>
    </div>
  );
}
