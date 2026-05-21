import type { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";

const escapeTemplateLiteral = (content: string): string =>
  content.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const replaceEditorContent = (
  html: string,
  rootId: string,
  textareaName: string,
  content: string,
  imgSrc: string
): string | null => {
  const pattern = new RegExp(
    `(window\\.addEditor\\s*\\(\\s*document\\.getElementById\\("${rootId}"\\),\\s*"${escapeRegExp(textareaName)}",\\s*\`)([\\s\\S]*?)(\`,\\s*")([^"]*)("\\s*\\)\\s*;)`
  );

  if (!pattern.test(html)) {
    return null;
  }

  const escapedImgSrc = imgSrc.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  return html.replace(
    pattern,
    `$1${escapeTemplateLiteral(content)}$3${escapedImgSrc}$5`
  );
};

export const devSaveHtmlPlugin = (): Plugin => ({
  name: "dev-save-html",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/api/dev/save-content", (req, res, next) => {
      if (req.method !== "POST") {
        next();
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        try {
          const payload = JSON.parse(body) as {
            content?: string;
            rootId?: string;
            textareaName?: string;
            imgSrc?: string;
          };

          if (typeof payload.content !== "string") {
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, error: "content is required" }));
            return;
          }

          const rootId = payload.rootId ?? "root1";
          const textareaName = payload.textareaName ?? "test";
          const imgSrc = payload.imgSrc ?? "";
          const indexPath = path.resolve(server.config.root, "index.html");
          const html = fs.readFileSync(indexPath, "utf-8");
          const updated = replaceEditorContent(
            html,
            rootId,
            textareaName,
            payload.content,
            imgSrc
          );

          if (!updated) {
            res.statusCode = 404;
            res.end(
              JSON.stringify({
                success: false,
                error: `addEditor block for #${rootId} not found in index.html`,
              })
            );
            return;
          }

          fs.writeFileSync(indexPath, updated, "utf-8");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true, file: "index.html" }));
        } catch (error) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            })
          );
        }
      });
    });
  },
});
