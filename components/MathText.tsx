"use client";

import katex from "katex";
import { useMemo } from "react";

const DOLLAR = "\uE000"; // remplace temporairement \$ (dollar littéral)

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Affiche du texte avec des formules $...$ rendues par KaTeX.
 * Écrire \$ pour un dollar littéral (ex. « 20 \$ »).
 */
export default function MathText({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => {
    return text
      .replace(/\\\$/g, DOLLAR)
      .split(/(\$[^$]+\$)/g)
      .map((part) => {
        if (part.length > 2 && part.startsWith("$") && part.endsWith("$")) {
          return katex.renderToString(part.slice(1, -1), { throwOnError: false });
        }
        return escapeHtml(part).split(DOLLAR).join("$");
      })
      .join("");
  }, [text]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
