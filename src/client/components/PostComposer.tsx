import { useEffect, useRef, useState } from 'react';
import { useFetcher, type FetcherWithComponents } from 'react-router';
import { LIMITS } from '../../shared/types.ts';
import type { ThreadActionData } from '../lib/types.ts';
import { Confetti } from './Confetti.tsx';
import { Field } from './Field.tsx';
import { PhotoPicker } from './PhotoPicker.tsx';
import { useToast } from './Toaster.tsx';
import './PostComposer.css';

interface Props {
  threadId: number;
  isMarketplace: boolean;
}

export function PostComposer({ threadId, isMarketplace }: Props) {
  const fetcher = useFetcher<ThreadActionData>();
  const toast = useToast();
  const summary = useRef<HTMLDivElement>(null);

  const result = fetcher.data?.intent === 'create' ? fetcher.data : undefined;
  const idle = fetcher.state === 'idle';
  const failure = result && !result.ok ? result : null;
  // Each successful post remounts the form (clearing every field) and fires confetti.
  const successKey = result?.ok ? (result.id ?? 'ok') : 0;

  useEffect(() => {
    if (!idle || !result) return;
    if (result.ok) toast(isMarketplace ? 'Your listing is live!' : 'Posted! Thanks for sharing.');
    // Move focus to the error summary so keyboard and screen-reader users land on it.
    else summary.current?.focus();
  }, [idle, result, toast, isMarketplace]);

  return (
    <section className="composer card" aria-labelledby="composer-title">
      <Confetti fire={successKey} />
      <h2 id="composer-title" className="composer__title">
        {isMarketplace ? 'List an item' : 'Share something'}
      </h2>
      <p className="composer__lede">
        {isMarketplace
          ? 'Outgrown it? Pass it on to another family.'
          : 'No judgement here. We’ve all been there.'}
      </p>

      {failure && (
        <div ref={summary} className="composer__summary" tabIndex={-1} role="alert">
          <p>
            <strong>{failure.message}</strong>
          </p>
          {Object.keys(failure.errors).length > 0 && (
            <ul>
              {Object.entries(failure.errors).map(([field, msg]) => (
                <li key={field}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ComposerForm
        key={successKey}
        fetcher={fetcher}
        threadId={threadId}
        isMarketplace={isMarketplace}
        errors={failure?.errors ?? {}}
      />
    </section>
  );
}

function ComposerForm({
  fetcher,
  threadId,
  isMarketplace,
  errors,
}: Props & { fetcher: FetcherWithComponents<ThreadActionData>; errors: Record<string, string> }) {
  const [textLength, setTextLength] = useState(0);
  const busy = fetcher.state !== 'idle';

  return (
    <fetcher.Form
      method="post"
      encType="multipart/form-data"
      className="composer__form"
      aria-busy={busy}
    >
      <input type="hidden" name="intent" value="create" />
      <input type="hidden" name="threadId" value={threadId} />
      <div className={isMarketplace ? 'composer__row' : undefined}>
        <Field
          label={isMarketplace ? 'Item' : 'Title'}
          name="title"
          placeholder={isMarketplace ? 'Baby nappies…' : 'An interesting story'}
          maxLength={LIMITS.titleMax}
          autoComplete="off"
          error={errors.title}
        />
        {isMarketplace && (
          <Field
            label={
              <>
                Price <abbr title="Australian dollars">(AUD)</abbr>
              </>
            }
            name="price"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            prefix="$"
            placeholder="0.00"
            error={errors.price}
          />
        )}
      </div>
      <Field
        as="textarea"
        label="Description"
        name="text"
        rows={3}
        placeholder={isMarketplace ? 'Condition, size, pick-up suburb…' : 'Describe what happened'}
        maxLength={LIMITS.textMax}
        onChange={(e) => setTextLength(e.currentTarget.value.length)}
        counter={{ value: textLength, max: LIMITS.textMax }}
        error={errors.text}
      />
      <PhotoPicker name="upload" error={errors.upload} />
      <Field
        label="Describe your photo"
        name="alt"
        optional
        maxLength={LIMITS.altMax}
        hint="Helps people using screen readers. e.g. “Toddler asleep in a laundry basket”."
        error={errors.alt}
      />
      <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
        {busy ? (
          <>
            <span className="spinner" aria-hidden="true" /> Posting…
          </>
        ) : isMarketplace ? (
          'Post listing'
        ) : (
          'Post it'
        )}
      </button>
    </fetcher.Form>
  );
}
