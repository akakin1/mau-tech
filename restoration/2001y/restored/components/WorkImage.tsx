import Image, { type ImageProps } from 'next/image';
import previews from 'content/work-previews.json';

type Props = ImageProps & { fullResolution?: boolean };

// Native <picture> selects the CMS's uncropped derivative before fetching the image.
// Zoom keeps the full original; the image error handler can use its exact mirror.
export default function WorkImage({ fullResolution = false, sizes, alt, ...props }: Props) {
  const variants = !fullResolution && typeof props.src === 'string' && previews[props.src];
  return (
    <picture style={{ display: 'contents' }}>
      {variants && <source sizes={sizes} srcSet={variants.map(image => `${image.src} ${image.width}w`).join(', ')} />}
      <Image {...props} alt={alt} unoptimized />
    </picture>
  );
}
