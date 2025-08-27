import multiavatar from '@multiavatar/multiavatar/esm';
import { useEffect, useMemo, useState } from 'react';

export default function UserAvatar({
  size = 'size-9',
  imageUrl,
  name = 'User',
}: {
  imageUrl?: string;
  size?: string;
  name?: string;
}) {
  const fallbackSvg = useMemo(() => {
    const svg = multiavatar(name);
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }, [name]);

  const [avatarSrc, setAvatarSrc] = useState(fallbackSvg);

  useEffect(() => {
    let isMounted = true;

    if (!imageUrl?.length) {
      if (isMounted) setAvatarSrc(fallbackSvg);
      return;
    }

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      if (isMounted) setAvatarSrc(imageUrl);
    };

    img.onerror = () => {
      if (isMounted) setAvatarSrc(fallbackSvg);
    };

    return () => {
      isMounted = false;
    };
  }, [imageUrl, fallbackSvg]);


  return (
    <div className="group relative inline-block">
      <img
        src={avatarSrc}
        alt={name + ' avatar'}
        className={'rounded-full ' + size}
        aria-label="User avatar"
      />
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="bg-card outline-border text-muted-foreground rounded border px-2 py-1 text-xs whitespace-nowrap shadow-md">
          {name}
        </div>
      </div>
    </div>
  );
}
