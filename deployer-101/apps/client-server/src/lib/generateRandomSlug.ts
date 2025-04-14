import { generateSlug } from "random-word-slugs";
export const generateRandomSubdomain = () => {
  const slug = generateSlug(2, {
    format: "lower",
  });

  const slugParts = slug.split(" ").join("-");
  return slugParts;
};
