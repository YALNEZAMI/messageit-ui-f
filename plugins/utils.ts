export default defineNuxtPlugin(() => {
  /**
   * Remove duplicate objects based on their `_id` property.
   * @param array - Array of objects with `_id` property
   * @returns Array with unique objects by `_id`
   */
  function removeDuplicateById(array: any[]): any[] {
    const uniqueObjects = new Map<string, any>();
    for (const obj of array) {
      uniqueObjects.set(obj._id, obj); // Overwrites existing object with the same _id
    }
    return Array.from(uniqueObjects.values());
  }
  function getFormatedDate(string: string): string {
    const date = new Date(string);
    return date.toISOString();
  }
  // Provide the utility function to the Nuxt app context
  return {
    provide: {
      removeDuplicateById,
      getFormatedDate,
    },
  };
});
