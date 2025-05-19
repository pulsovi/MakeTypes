// Add any more invalid charachaters here
const invalidChars = /[0-9-+\*\/\?: ]/g;

/**
 * Sanitize record key string
 */
export function safeField(field: string)
{
  return field.match(invalidChars)
    ? `"${field}"`
    : field;
}

/**
 * Sanitize interface class name
 */
export function safeInterfaceName(name: string) {
  return name.match(invalidChars)
    ? name.replace(invalidChars, "_")
    : name;
}

/**
 * Sanitize object child chaining
 */
export function safeObjectField(objectName: string, field?: string)
{
  if (!field) return safeField(objectName);
  return field.match(invalidChars)
    ? `${objectName}["${field}"]`
    : `${objectName}.${field}`;
}
