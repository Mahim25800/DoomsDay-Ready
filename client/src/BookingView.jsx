import { useEffect, useState } from 'react';
import { request } from './api';

function QuoteResult({ quote }) {
  return (
    <section className="booking-panel" aria-labelledby="quote-heading">
      <h2 id="quote-heading">Booking quote</h2>
      {quote.possible ? (
        <>
          <p className="quote-total" role="status">
            {quote.groupSize} {quote.groupSize === 1 ? 'seat' : 'seats'} in {quote.bundleCount}{' '}
            {quote.bundleCount === 1 ? 'bundle' : 'bundles'}
          </p>
          <ul className="quote-bundles">
            {quote.bundles.map(({ size, quantity }) => (
              <li key={size}>
                <span>{size}-seat {quantity === 1 ? 'bundle' : 'bundles'}</span>
                <strong>× {quantity}</strong>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p role="status">Not possible. The available bundles cannot seat exactly {quote.groupSize} people.</p>
      )}
    </section>
  );
}

export function BookingView() {
  const [cinemas, setCinemas] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [cinemaId, setCinemaId] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    request('/cinemas', { signal: controller.signal }).then(cinemas => {
      if (!controller.signal.aborted) setCinemas(cinemas);
    }).catch(() => {
      if (!controller.signal.aborted) setLoadError('Could not load the cinemas.');
    });
    return () => controller.abort();
  }, [loadAttempt]);

  const cinema = cinemas?.find(cinema => cinema.id === Number(cinemaId));

  function clearQuote() {
    setQuote(null);
    setQuoteError('');
  }

  async function getQuote(event) {
    event.preventDefault();
    if (!cinema || pending) return;

    const groupSize = Number(new FormData(event.currentTarget).get('groupSize'));
    clearQuote();
    setPending(true);
    try {
      const result = await request(`/cinemas/${cinema.id}/booking?groupSize=${groupSize}`);
      setQuote({ ...result, groupSize });
    } catch (error) {
      setQuoteError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="page-width app-page">
      <div className="page-heading">
        <h1>Booking</h1>
        <p>Find seat bundles for the <em>Avengers: Doomsday</em> premiere.</p>
      </div>
      {loadError && (
        <div>
          <p className="error" role="alert">{loadError}</p>
          <button type="button" onClick={() => { setLoadError(''); setLoadAttempt(attempt => attempt + 1); }}>Try again</button>
        </div>
      )}
      {!cinemas && !loadError && <p role="status">Loading cinemas…</p>}
      {cinemas?.length === 0 && <p>No cinemas are available yet.</p>}
      {cinemas?.length > 0 && (
        <div className="booking-layout">
          <section className="booking-panel" aria-labelledby="booking-form-heading">
            <h2 id="booking-form-heading">Group details</h2>
            <form onSubmit={getQuote}>
              <fieldset className="form-fields" disabled={pending}>
                <div>
                  <label htmlFor="booking-cinema">Cinema</label>
                  <select id="booking-cinema" value={cinemaId} required onChange={event => {
                    setCinemaId(event.target.value);
                    clearQuote();
                  }}>
                    <option value="">Choose a cinema</option>
                    {cinemas.map(cinema => <option key={cinema.id} value={cinema.id}>{cinema.name}</option>)}
                  </select>
                </div>
                {cinema && <p className="muted">Bundle sizes: {cinema.bundleSizes.join(', ')} seats</p>}
                <label>
                  Group size
                  <input name="groupSize" type="number" min="1" max="10000" step="1" required onChange={clearQuote} />
                </label>
                <button className="primary" type="submit">{pending ? 'Getting quote…' : 'Get quote'}</button>
              </fieldset>
              {quoteError && <p className="error" role="alert">{quoteError}</p>}
            </form>
          </section>
          {quote && <QuoteResult quote={quote} />}
        </div>
      )}
    </main>
  );
}
