import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FocusRail } from 'components/ui/focus-rail';

const serverUrl = 'http://localhost:8080';

function formatAge(age) {
  if (age === 1) return '1 year old';
  return `${age} years old`;
}

function mapProducerToRailItem(producer) {
  return {
    id: producer.id,
    title: producer.name,
    description: producer.story,
    imageSrc: producer.imageUrl,
    meta: `${formatAge(producer.age)} · ${producer.eggsInNest} eggs in nest`,
  };
}

export function OurProducers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducers() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${serverUrl}/producers`);
        if (!cancelled) {
          setItems(response.data.map(mapProducerToRailItem));
        }
      } catch {
        if (!cancelled) {
          setError('Could not load the flock. Make sure the server is running.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducers();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="producers-heading" className="mt-16">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-yolk-500">
          Meet the flock
        </p>
        <h2 id="producers-heading" className="font-display text-3xl font-bold text-cream-50 sm:text-4xl">
          Our Producers
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-cream-200/60">
          Swipe, scroll, or use the arrows to meet the hens behind every egg.
        </p>
      </div>

      {loading && (
        <div className="card flex h-[520px] items-center justify-center sm:h-[580px]">
          <p className="text-sm text-cream-200/50">Gathering the flock…</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <FocusRail items={items} autoPlay={false} loop />
      )}
    </section>
  );
}
