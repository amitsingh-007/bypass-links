export const HEADER_HEIGHT = 56;

/**
 * The cropper and the upload API must agree, or every uploaded avatar gets
 * silently rescaled. They previously tracked each other by paired comments.
 */
export const PERSON_IMAGE_SIZE = 250;

/**
 * Canonical repository identity. Lives here rather than in @bypass/trpc so
 * client components can import it without pulling in a server package.
 */
export const REPO = {
  OWNER: 'amitsingh-007',
  NAME: 'bypass-links',
};

export const GITHUB_REPO_URL = `https://github.com/${REPO.OWNER}/${REPO.NAME}`;
