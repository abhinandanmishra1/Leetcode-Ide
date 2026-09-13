export function decodeIfNeeded(value, isBase64) {
  if (!value) return '';
  if (!isBase64) return value;
  try {
    return Buffer.from(value, 'base64').toString('utf-8');
  } catch (err) {
    return value;
  }
}

export function encodeIfNeeded(value, isBase64) {
  if (value === null || value === undefined) return null;
  if (!isBase64) return value;
  return Buffer.from(String(value), 'utf-8').toString('base64');
}

export default {
  decodeIfNeeded,
  encodeIfNeeded,
};
