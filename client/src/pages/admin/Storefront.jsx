import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import readImage from '../../components/readImage.js';

export default function Storefront() {
  const { notify } = useAuth();
  const [banner, setBanner] = useState(null);
  const [cats, setCats] = useState([]);
  const [newCat, setNewCat] = useState('');

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => {
      setBanner(data.banner);
      setCats(data.categories);
    });
  }, []);

  if (!banner) return <p className="muted">Loading…</p>;

  const saveBanner = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', { banner });
      notify('Banner saved');
    } catch (x) {
      notify(errMsg(x));
    }
  };
  const saveCats = async (next) => {
    try {
      const { data } = await api.put('/admin/settings', { categories: next });
      setCats(data.categories);
      notify('Categories saved');
    } catch (x) {
      notify(errMsg(x));
    }
  };
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBanner({ ...banner, image: await readImage(file, 1200) });
      notify('Image attached. Save the banner to publish it.');
    } catch (x) {
      notify('That image could not be read');
    }
  };

  return (
    <div className="two">
      <form className="card pad frm" onSubmit={saveBanner}>
        <h3 className="full">Home banner</h3>
        <div className="field full"><label htmlFor="b-head">Headline</label><input id="b-head" required value={banner.headline} onChange={(e) => setBanner({ ...banner, headline: e.target.value })} /></div>
        <div className="field full"><label htmlFor="b-sub">Subline</label><textarea id="b-sub" value={banner.sub} onChange={(e) => setBanner({ ...banner, sub: e.target.value })} /></div>
        <div className="field full"><label htmlFor="b-hue">Banner color</label><input id="b-hue" type="range" min="0" max="360" value={banner.hue} onChange={(e) => setBanner({ ...banner, hue: +e.target.value })} /></div>
        <div className="field full">
          <label htmlFor="b-img">Banner image (optional)</label>
          <input id="b-img" type="file" accept="image/*" onChange={pick} />
          <small>
            {banner.image ? <>Image attached. <button type="button" className="lnk" style={{ color: 'var(--accent)' }} onClick={() => setBanner({ ...banner, image: '' })}>Remove</button></> : 'Without an image, product tiles are shown.'}
          </small>
        </div>
        <div className="full"><button className="btn primary">Save banner</button></div>
      </form>

      <div className="card pad" style={{ display: 'grid', gap: 12 }}>
        <h3>Categories</h3>
        {cats.map((c) => (
          <div className="ol" style={{ alignItems: 'center' }} key={c}>
            <span>{c}</span>
            <button className="btn sm danger" onClick={() => saveCats(cats.filter((x) => x !== c))}>Remove</button>
          </div>
        ))}
        <form className="frm" style={{ gridTemplateColumns: '1fr auto', alignItems: 'end' }} onSubmit={(e) => { e.preventDefault(); if (newCat.trim()) { saveCats([...cats, newCat.trim()]); setNewCat(''); } }}>
          <div className="field"><label htmlFor="n-cat">New category</label><input id="n-cat" required value={newCat} onChange={(e) => setNewCat(e.target.value)} /></div>
          <button className="btn">Add</button>
        </form>
      </div>
    </div>
  );
}
