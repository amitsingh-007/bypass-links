/** One dialect for prod detection, so the checks cannot drift apart. */
export const IS_PROD = process.env.NODE_ENV === 'production';
