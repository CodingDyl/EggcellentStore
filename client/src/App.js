import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { OurProducers } from 'components/OurProducers';
import { Toast } from 'components/Toast';

const serverUrl = 'http://localhost:8080';

function parseEggCount(data) {
  return Number(data?.eggs ?? 0);
}

function App() {
  const [stock, setStock] = useState(0);
  const [predictedYield, setPredictedYield] = useState(null);
  const [projectedForecast, setProjectedForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);
  const [order, setOrder] = useState('');
  const [toast, setToast] = useState(null);
  const [orderPending, setOrderPending] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const toastIdRef = useRef(0);

  const showToast = useCallback((type, message) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, type, message });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const fetchStock = useCallback(async () => {
    const response = await axios.get(`${serverUrl}/stock`);
    setStock(parseEggCount(response.data));
  }, []);

  const fetchForecast = useCallback(async (dayCount) => {
    const response = await axios.get(`${serverUrl}/stock/${dayCount}`);
    setPredictedYield(Number(response.data.predictedYield));
    setProjectedForecast(Number(response.data.projectedForecast));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        await fetchStock();
        if (!cancelled) {
          await fetchForecast(days);
        }
      } catch {
        if (!cancelled) {
          setError('Could not reach the coop server. Is it running on port 8080?');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [days, fetchStock, fetchForecast]);

  const handleDaysChange = (event) => {
    setDays(Number(event.target.value));
  };

  const handleOrderChange = (event) => {
    setOrder(event.target.value);
  };

  const handleOrder = async (event) => {
    event.preventDefault();
    const eggs = Number(order);

    if (!eggs || eggs <= 0) {
      showToast('error', 'Enter a valid number of eggs to order.');
      return;
    }

    setOrderPending(true);

    try {
      const orderId = Date.now();
      await axios.post(
        `${serverUrl}/order/${orderId}`,
        { order: { eggs } }
      );
      showToast('success', `Order placed — ${eggs} eggs heading out.`);
      setOrder('');
      await fetchStock();
    } catch (err) {
      if (err.response?.status === 404) {
        showToast('error', 'Not enough eggs in stock for that order.');
      } else {
        showToast('error', 'Order failed. Check your connection and try again.');
      }
    } finally {
      setOrderPending(false);
    }
  };

  const reset = async () => {
    setResetPending(true);

    try {
      await axios.post(`${serverUrl}/reset`);
      setOrder('');
      await fetchStock();
      await fetchForecast(days);
      setError(null);
    } catch {
      setError('Failed to reset the flock.');
    } finally {
      setResetPending(false);
    }
  };

  return (
    <>
    {toast && (
      <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
    )}
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-yolk-500">
            Coop dashboard
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-cream-50 sm:text-5xl">
            Eggcellent
          </h1>
          <p className="mx-auto mt-3 max-w-md text-cream-200/70">
            Track today&apos;s stock, forecast future yield, and place orders from the barn.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <section
          aria-labelledby="stock-heading"
          className="card relative mb-6 overflow-hidden text-center shadow-glow"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-yolk-500/10 to-transparent"
            aria-hidden="true"
          />
          <h2 id="stock-heading" className="relative text-sm font-medium uppercase tracking-wider text-cream-200/60">
            Eggs in stock
          </h2>
          {loading ? (
            <p className="relative mt-4 font-display text-5xl font-bold text-cream-200/40 sm:text-6xl">
              —
            </p>
          ) : (
            <p className="relative mt-2 font-display text-6xl font-bold text-yolk-400 sm:text-7xl">
              {stock.toLocaleString()}
            </p>
          )}
          <p className="relative mt-2 text-sm text-cream-200/50">ready to ship today</p>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <section aria-labelledby="forecast-heading" className="card">
            <h2 id="forecast-heading" className="font-display text-xl font-semibold text-cream-50">
              Forecast
            </h2>
            <p className="mt-1 text-sm text-cream-200/60">
              Predicted new laying and total projected stock.
            </p>

            <label htmlFor="days-input" className="mt-5 block text-sm font-medium text-cream-200/80">
              Days ahead
            </label>
            <input
              id="days-input"
              type="number"
              min="1"
              value={days}
              onChange={handleDaysChange}
              className="input-field mt-2"
            />

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-barn-700/50 bg-barn-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-cream-200/50">Predicted yield</p>
                <p className="mt-1 font-display text-2xl font-semibold text-yolk-400">
                  {loading || predictedYield === null ? '—' : predictedYield.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-cream-200/45">New eggs from living hens over {days} days</p>
              </div>
              <div className="rounded-xl border border-barn-700/50 bg-barn-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-cream-200/50">Projected forecast</p>
                <p className="mt-1 font-display text-3xl font-semibold text-cream-100">
                  {loading || projectedForecast === null ? '—' : projectedForecast.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-cream-200/45">Current stock + predicted yield</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="order-heading" className="card">
            <h2 id="order-heading" className="font-display text-xl font-semibold text-cream-50">
              Place order
            </h2>
            <p className="mt-1 text-sm text-cream-200/60">
              Request eggs from current inventory.
            </p>

            <form onSubmit={handleOrder} className="mt-5">
              <label htmlFor="order-input" className="block text-sm font-medium text-cream-200/80">
                Quantity
              </label>
              <input
                id="order-input"
                type="number"
                min="1"
                value={order}
                onChange={handleOrderChange}
                placeholder="e.g. 12"
                className="input-field mt-2"
              />

              <button
                type="submit"
                className="btn-primary mt-5 w-full"
                disabled={orderPending || loading}
              >
                {orderPending ? 'Placing order…' : 'Place order'}
              </button>
            </form>
          </section>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={reset}
            className="btn-secondary"
            disabled={resetPending || loading}
          >
            {resetPending ? 'Resetting flock…' : 'Reset flock'}
          </button>
        </div>

        <OurProducers />
      </main>
    </div>
    </>
  );
}

export default App;
