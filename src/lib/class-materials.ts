// Text extraction for "Mi Clase" uploads. Only the extracted plain text is
// ever persisted (see ClassMaterial.extractedText) — the original file
// bytes are never stored, matching the app's existing text-first approach
// (e.g. Speaking never stores audio either).

// Cap what gets sent to the AI per generation — long enough for a real
// handout/unit of notes, short enough to keep prompts (and cost) sane.
export const MATERIAL_MAX_CHARS = 20000;

export type ExtractedMaterial = { text: string; truncated: boolean };

function truncate(raw: string): ExtractedMaterial {
  const text = raw.trim();
  if (text.length <= MATERIAL_MAX_CHARS) return { text, truncated: false };
  return { text: text.slice(0, MATERIAL_MAX_CHARS), truncated: true };
}

/** Extracts plain text from an uploaded .txt/.pdf/.docx file. Throws a user-facing message for unsupported types or a genuinely unreadable file. */
export async function extractTextFromFile(file: File): Promise<{ text: string; truncated: boolean; fileType: string }> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".txt") || file.type === "text/plain") {
    const { text, truncated } = truncate(buffer.toString("utf-8"));
    return { text, truncated, fileType: "txt" };
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      const { text, truncated } = truncate(result.text);
      if (!text) throw new Error("El PDF no contiene texto extraíble (¿es una imagen escaneada?).");
      return { text, truncated, fileType: "pdf" };
    } finally {
      await parser.destroy();
    }
  }

  if (
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer });
    const { text, truncated } = truncate(result.value);
    if (!text) throw new Error("No se pudo extraer texto de este documento.");
    return { text, truncated, fileType: "docx" };
  }

  throw new Error("Formato no soportado. Sube un archivo .txt, .pdf o .docx, o pega el texto directamente.");
}

/** Used for pasted-text uploads (no file at all). */
export function extractTextFromPaste(raw: string): ExtractedMaterial {
  return truncate(raw);
}
