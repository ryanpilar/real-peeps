/**
 * This function takes a string representing a variant name as input, extracts the name of the variant style, 
 * and returns it. 
 */

export const formatVariantName = (variantName: string): string => {
  
  // Split the variant name by the " - " separator and extract the second element (i.e., the variant style name).
  const [, name] = variantName.split(" - ");

  // If the variant style name is defined, return it; otherwise, return the default value "One style".
  return name ? name : "One style";
};
