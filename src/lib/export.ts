import { getPalette, type SavedResult } from "@/lib/gacha";

function wrapText(context: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    let line = "";
    for (const character of paragraph) {
      if (context.measureText(line + character).width > width && line) {
        lines.push(line.trim());
        line = "";
      }
      line += character;
    }
    lines.push(line.trim());
  }
  return lines;
}

export async function exportCombination(result: SavedResult) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image export is unavailable in this browser.");

  const width = 1000;
  const padding = 48;
  const valueX = 390;
  const valueWidth = width - padding - valueX;
  const fontFamily = getComputedStyle(document.body).fontFamily;
  const rows = result.items.map((item) => {
    context.font = `400 20px ${fontFamily}`;
    const labels = wrapText(context, item.categoryName, valueX - padding - 40);
    const palette = getPalette(item.itemValue);
    const title = palette.length ? item.itemValue.split(" · ")[0] : item.itemValue;
    context.font = `600 24px ${fontFamily}`;
    const values = wrapText(context, title, valueWidth);
    const paletteRows = Math.ceil(palette.length / Math.floor(valueWidth / 32));
    return { labels, values, palette, height: Math.max(labels.length * 30, values.length * 34 + paletteRows * 32) + 40 };
  });
  const height = 160 + rows.reduce((total, row) => total + row.height, 0) + 100;
  if (height > 16000) throw new Error("This combination is too tall to export. Try fewer or shorter options.");
  canvas.width = width;
  canvas.height = height;

  const isLight = document.documentElement.classList.contains("darkmode");
  const colors = isLight
    ? { background: "#ffffff", foreground: "#111827", muted: "#63738a", line: "#dce4f0", accent: "#2563eb" }
    : { background: "#111927", foreground: "#f9fafb", muted: "#9ca3af", line: "#253147", accent: "#60a5fa" };
  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, height);
  context.fillStyle = colors.accent;
  context.fillRect(0, 0, width, 5);
  context.textBaseline = "top";
  context.font = `500 14px ${fontFamily}`;
  context.fillText("GACHA / SAVED COMBINATION", padding, 40);
  context.fillStyle = colors.foreground;
  context.font = `700 32px ${fontFamily}`;
  context.fillText(result.title || "Saved combination", padding, 78, width - padding * 2);

  let y = 160;
  for (const row of rows) {
    context.fillStyle = colors.line;
    context.fillRect(padding, y, width - padding * 2, 1);
    context.textAlign = "left";
    context.fillStyle = colors.muted;
    context.font = `400 20px ${fontFamily}`;
    row.labels.forEach((line, index) => context.fillText(line, padding, y + 20 + index * 30));
    context.textAlign = "right";
    context.fillStyle = colors.foreground;
    context.font = `600 24px ${fontFamily}`;
    row.values.forEach((line, index) => context.fillText(line, width - padding, y + 20 + index * 34));
    const columns = Math.floor(valueWidth / 32);
    row.palette.forEach((color, index) => {
      const column = index % columns;
      const rowIndex = Math.floor(index / columns);
      const count = Math.min(columns, row.palette.length - rowIndex * columns);
      context.beginPath();
      context.arc(width - padding - (count - column - 1) * 32 - 12, y + 20 + row.values.length * 34 + rowIndex * 32 + 12, 11, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
      context.strokeStyle = colors.line;
      context.stroke();
    });
    y += row.height;
  }

  context.fillStyle = colors.line;
  context.fillRect(padding, y, width - padding * 2, 1);
  context.fillStyle = colors.muted;
  const footerY = y + 40;
  context.textBaseline = "alphabetic";
  context.font = `400 16px ${fontFamily}`;
  context.textAlign = "left";
  context.fillText(new Date(result.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }), padding, footerY);
  context.textAlign = "right";
  context.font = `500 14px ${fontFamily}`;
  context.fillText("nww-gacha.vercel.app", width - padding, footerY);

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((image) => image ? resolve(image) : reject(new Error("Could not create the PNG.")), "image/png"));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const name = (result.title || "Saved combination").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 80).replace(/^-+|-+$/g, "") || "saved-combination";
  link.download = `${name}-gacha.png`;
  try {
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}