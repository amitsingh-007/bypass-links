'use client';

import { use } from 'react';
import { browser } from 'react-dom';

function ReleaseDate({ releaseDate }: { releaseDate: string }) {
  use(browser('release date renders in the visitor local timezone'));

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(releaseDate));
}

export default ReleaseDate;
