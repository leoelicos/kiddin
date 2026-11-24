import { useEffect, useId, useState } from 'react';
import { ACCEPTED_IMAGE_TYPES, LIMITS } from '../../shared/types.ts';
import './PhotoPicker.css';

/**
 * Photo picker built on a real <input type="file"> that covers the whole drop
 * zone, so clicking, keyboard (Enter/Space) and native drag-and-drop all work
 * with every assistive technology. Shows a live preview.
 */
export function PhotoPicker({ name, error }: { name: string; error?: string | undefined }) {
  const id = useId();
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!preview) return;
    const { url } = preview;
    return () => URL.revokeObjectURL(url);
  }, [preview]);

  function choose(input: HTMLInputElement) {
    setDragging(false);
    setLocalError(null);
    const file = input.files?.[0];
    if (!file) return setPreview(null);
    let problem: string | null = null;
    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      problem = 'Please choose a JPG, PNG, WebP or AVIF image.';
    } else if (file.size > LIMITS.uploadBytes) {
      problem = 'That photo is over 8 MB. Please pick a smaller one.';
    }
    if (problem) {
      input.value = '';
      setLocalError(problem);
      return setPreview(null);
    }
    setPreview({ url: URL.createObjectURL(file), name: file.name });
  }

  const shownError = localError ?? error;
  const errorId = shownError ? `${id}-error` : undefined;

  return (
    <div className="photo-picker" data-invalid={shownError ? '' : undefined}>
      <span className="field__label" id={`${id}-label`}>
        Photo
      </span>
      <label
        htmlFor={id}
        className="photo-picker__drop"
        data-dragging={dragging ? '' : undefined}
        data-has-preview={preview ? '' : undefined}
      >
        {preview ? (
          <>
            <img src={preview.url} alt="" className="photo-picker__preview" />
            <span className="photo-picker__change">
              <span aria-hidden="true">↻</span> Change photo
            </span>
          </>
        ) : (
          <span className="photo-picker__empty">
            <span className="photo-picker__icon" aria-hidden="true">
              📸
            </span>
            <span>
              <strong>Choose a photo</strong> or drag it here
            </span>
            <span className="photo-picker__small" id={`${id}-hint`}>
              JPG, PNG, WebP or AVIF · up to 8 MB
            </span>
          </span>
        )}
        <input
          id={id}
          name={name}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          required
          aria-labelledby={`${id}-label`}
          aria-describedby={[errorId, preview ? `${id}-file` : `${id}-hint`]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={shownError ? true : undefined}
          className="photo-picker__input"
          onChange={(e) => choose(e.currentTarget)}
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDrop={() => setDragging(false)}
        />
      </label>
      {preview && (
        <p id={`${id}-file`} className="sr-only">
          Selected: {preview.name}
        </p>
      )}
      {shownError && (
        <p id={errorId} className="field__error">
          <span aria-hidden="true">⚠ </span>
          {shownError}
        </p>
      )}
    </div>
  );
}
