module.exports = (permissions, required) => {
  if (permissions.hasOwnProperty('*')) return true;

  let i = 0;
  let current = permissions[required[i++]];

  if (typeof required === 'string') {
    required = [required];
  }

  while (required[i] && Boolean(current) && current.constructor === Object) {
    current = current[required[i++]];
  }

  return current;
};