import { useEffect, useState } from 'react';

function AsyncFontLoader() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <link
      href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400&display=swap"
      rel="stylesheet"
    />
  );
}

export default AsyncFontLoader;
