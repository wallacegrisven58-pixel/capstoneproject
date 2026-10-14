// Illustrations used when a product has no photo. Drawn with currentColor so the tile tint sets the color.
const ART = {
  bracelets: '<ellipse cx="100" cy="112" rx="64" ry="50" fill="none" stroke="currentColor" stroke-width="13"/><ellipse cx="100" cy="109" rx="64" ry="50" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><circle cx="100" cy="62" r="8" fill="currentColor"/><circle cx="76" cy="66" r="5" fill="currentColor"/><circle cx="124" cy="66" r="5" fill="currentColor"/>',
  bags: '<path d="M70 84c0-30 12-46 30-46s30 16 30 46" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><rect x="42" y="80" width="116" height="88" rx="14" fill="currentColor"/><path d="M42 108h116" stroke="#fff" stroke-opacity=".32" stroke-width="3"/><circle cx="100" cy="108" r="7" fill="#fff" fill-opacity=".6"/>',
  earrings: '<path d="M64 30v22M136 30v22" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="64" cy="86" r="28" fill="none" stroke="currentColor" stroke-width="9"/><circle cx="136" cy="86" r="28" fill="none" stroke="currentColor" stroke-width="9"/><circle cx="64" cy="146" r="12" fill="currentColor"/><circle cx="136" cy="146" r="12" fill="currentColor"/>',
  watches: '<rect x="78" y="14" width="44" height="52" rx="8" fill="currentColor" fill-opacity=".55"/><rect x="78" y="134" width="44" height="52" rx="8" fill="currentColor" fill-opacity=".55"/><circle cx="100" cy="100" r="50" fill="currentColor"/><circle cx="100" cy="100" r="40" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><path d="M100 100V72M100 100l20 12" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
  sunglasses: '<path d="M24 84h152" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M30 84h68c0 28-14 46-34 46S30 112 30 84z" fill="currentColor"/><path d="M102 84h68c0 28-14 46-34 46s-34-18-34-46z" fill="currentColor"/><path d="M98 90q2-9 4 0" fill="none" stroke="currentColor" stroke-width="5"/>',
  scarves: '<path d="M46 40c34 16 74 16 108 0l6 36c-36 16-84 16-120 0z" fill="currentColor"/><path d="M76 74l-20 96 34-12 14 20 14-102z" fill="currentColor" fill-opacity=".72"/><path d="M118 80l28 90 24-14-26-84z" fill="currentColor" fill-opacity=".55"/>',
};
const FALLBACK =
  '<path d="M58 82l22-32h40l22 32-42 76z" fill="currentColor"/><path d="M58 82h84M80 50l20 32 20-32M100 82v76" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/>';

export default function ProductArt({ product }) {
  return (
    <div className="tile" style={{ '--h': product.hue ?? 200 }}>
      {product.image ? (
        <img src={product.image} alt="" />
      ) : (
        <svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: ART[String(product.category).toLowerCase()] || FALLBACK }}
        />
      )}
    </div>
  );
}
