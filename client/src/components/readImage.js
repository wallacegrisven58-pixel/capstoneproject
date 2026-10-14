// Reads an image file, shrinks it and returns a JPEG data URI so it stays small in the database.
export default function readImage(file, max = 700) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * k);
        c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.72));
      };
      im.onerror = reject;
      im.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
