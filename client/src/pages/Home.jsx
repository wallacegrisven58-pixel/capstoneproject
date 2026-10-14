import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg, money } from '../api.js';
import ProductArt from '../components/ProductArt.jsx';
import ProductCard from '../components/ProductCard.jsx';

const readViewed = () => {
  try {
    return JSON.parse(localStorage.getItem('shopez_viewed') || '[]');
  } catch (e) {
    return [];
  }
};

export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [settings, setSettings] = useState({ banner: {}, categories: [] });
  const [all, setAll] = useState([]);
  const [error, setError] = useState('');
  const [cat, setCat] = useState('All');
  const [max, setMax] = useState(null);
  const [sort, setSort] = useState('featured');
  const [gift, setGift] = useState({ cat: 'All', max: '0' });
  const catalog = useRef(null);

  useEffect(() => {
    Promise.all([api.get('/admin/settings'), api.get('/products')])
      .then(([s, p]) => {
        setSettings(s.data);
        setAll(p.data);
      })
      .catch((e) => setError(errMsg(e)));
  }, []);

  const rangeMax = useMemo(() => Math.max(10, Math.ceil(Math.max(0, ...all.map((p) => p.finalPrice)) / 10) * 10), [all]);
  const limit = max == null ? rangeMax : max;

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let l = all.filter(
      (p) =>
        (cat === 'All' || p.category === cat) &&
        p.finalPrice <= limit &&
        (!needle || `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(needle))
    );
    const by = {
      low: (a, b) => a.finalPrice - b.finalPrice,
      high: (a, b) => b.finalPrice - a.finalPrice,
      rating: (a, b) => b.rating - a.rating,
      disc: (a, b) => b.discount - a.discount,
    }[sort];
    return by ? [...l].sort(by) : l;
  }, [all, cat, limit, q, sort]);

  const recs = useMemo(() => {
    const seen = readViewed();
    const w = {};
    seen.forEach((c) => (w[c] = (w[c] || 0) + 1));
    const top = Object.keys(w).sort((a, b) => w[b] - w[a])[0];
    const list = all
      .filter((p) => p.stock > 0)
      .sort((a, b) => (w[b.category] || 0) * 10 + b.rating - ((w[a.category] || 0) * 10 + a.rating))
      .slice(0, 4);
    return { list, reason: top ? `Because you looked at ${top.toLowerCase()}` : 'Top rated in the store right now' };
  }, [all]);

  const findGifts = (e) => {
    e.preventDefault();
    setCat(gift.cat);
    setMax(+gift.max ? +gift.max : null);
    setParams({});
    catalog.current?.scrollIntoView?.({ behavior: 'smooth' });
  };

  const b = settings.banner || {};
  if (error) return <div className="card empty"><h2>The store could not load</h2><p className="muted">{error}</p><p className="muted sm">Check that the server is running on port 8000.</p></div>;

  return (
    <>
      <section className="hero" style={{ '--h': b.hue ?? 172 }}>
        <div>
          <div className="eyebrow">Fashion accessories</div>
          <h1>{b.headline}</h1>
          <p className="sub">{b.sub}</p>
          <form className="finder" onSubmit={findGifts}>
            <div className="field">
              <label htmlFor="g-cat">Gift for</label>
              <select id="g-cat" value={gift.cat} onChange={(e) => setGift({ ...gift, cat: e.target.value })}>
                <option value="All">Any category</option>
                {settings.categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="g-max">Budget</label>
              <select id="g-max" value={gift.max} onChange={(e) => setGift({ ...gift, max: e.target.value })}>
                <option value="0">Any budget</option>
                <option value="30">Under $30</option>
                <option value="50">Under $50</option>
                <option value="100">Under $100</option>
              </select>
            </div>
            <button className="btn primary">Find gifts</button>
          </form>
        </div>
        {b.image ? (
          <img className="bimg" src={b.image} alt="" />
        ) : (
          <div className="mosaic" aria-hidden="true">
            {all.slice(0, 4).map((p) => <ProductArt key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {recs.list.length > 0 && (
        <section className="sec">
          <div className="sechead">
            <h2>Recommended for you</h2>
            <span className="muted sm">{recs.reason}</span>
          </div>
          <div className="grid">{recs.list.map((p) => <ProductCard key={p._id} p={p} />)}</div>
        </section>
      )}

      <section className="sec" ref={catalog}>
        <div className="sechead">
          <h2>{q ? `Results for “${q}”` : 'All accessories'}</h2>
          <span className="muted sm">{results.length} {results.length === 1 ? 'item' : 'items'}</span>
        </div>
        <div className="ctrl">
          <div className="chips">
            {['All', ...settings.categories].map((c) => (
              <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="opts">
            <div className="field">
              <label htmlFor="rng">Up to <b className="num">{money(limit)}</b></label>
              <input id="rng" type="range" min="10" max={rangeMax} step="5" value={limit} onChange={(e) => setMax(+e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sort">Sort by</label>
              <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="rating">Top rated</option>
                <option value="disc">Biggest discount</option>
              </select>
            </div>
          </div>
        </div>
        {results.length ? (
          <div className="grid">{results.map((p) => <ProductCard key={p._id} p={p} />)}</div>
        ) : (
          <div className="card empty">
            <h3>Nothing matches those filters</h3>
            <p className="muted">Try a different category or raise the budget.</p>
            <button className="btn primary" onClick={() => { setCat('All'); setMax(null); setParams({}); }}>Clear filters</button>
          </div>
        )}
      </section>
    </>
  );
}
