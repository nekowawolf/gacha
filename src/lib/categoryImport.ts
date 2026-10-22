export type ImportedCategory = { name: string; options: string[] };

export const MAX_IMPORT_BYTES = 512 * 1024;
export const CATEGORY_JSON_EXAMPLE = JSON.stringify({ categories: [
  { name: "Activity", options: ["Read a book", "Take a walk", "Try a new recipe"] },
  { name: "Location", options: ["At home", "At a café", "At the park"] },
] }, null, 2);

export function createCategoryPrompt(topic: string): string {
  return `Create categories and options for a random selection tool. One option will be selected from each category independently.
Topic: ${topic.trim() || "Everyday activities"}
Create 3–6 relevant categories with 5–10 distinct options each. Keep the options practical and easy to understand.
Return only valid JSON in this format: {"categories":[{"name":"Category name","options":["Option one","Option two"]}]}
Use double quotes, no comments, no trailing commas, and no explanation or Markdown fences. Category names must be 1–60 characters and options must be 1–160 characters. Do not include IDs or additional fields.`;
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export function parseCategoryImport(text: string): ImportedCategory[] {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) throw new Error("This JSON is too large. Use a file or text smaller than 512 KB.");
  const source = text.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i, "$1");
  if (!source) throw new Error("Paste your JSON or upload a .json file to continue.");
  let data: unknown;
  try { data = JSON.parse(source); } catch { throw new Error("This is not valid JSON. Use double quotes and remove comments or trailing commas."); }
  const categories = isObject(data) ? data.categories : undefined;
  if (!Array.isArray(categories) || categories.length === 0) throw new Error('Add a non-empty "categories" array. Each category needs a "name" and an "options" array.');
  if (categories.length > 50) throw new Error("Import up to 50 categories at a time.");
  return categories.map((category: unknown, index) => {
    const label = `Category ${index + 1}`;
    if (!isObject(category) || typeof category.name !== "string" || !category.name.trim() || category.name.trim().length > 60) throw new Error(`${label}: provide a name between 1 and 60 characters.`);
    if (!Array.isArray(category.options) || category.options.length === 0 || category.options.length > 100) throw new Error(`${label}: provide between 1 and 100 options in an array.`);
    const options = category.options.map((option: unknown, optionIndex) => {
      if (typeof option !== "string" || !option.trim() || option.trim().length > 160) throw new Error(`${label}, option ${optionIndex + 1}: use text between 1 and 160 characters.`);
      return option.trim();
    });
    return { name: category.name.trim(), options };
  });
}