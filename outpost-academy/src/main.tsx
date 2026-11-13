import React from "react";
import { createRoot } from "react-dom/client";
import "./i18n/index.ts";
import "./styles/index.css";
import "./styles/light.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./ui/ErrorBoundary.tsx";
import { installGlobalHandlers } from "./lib/resilience.ts";
installGlobalHandlers();
// Diagnostics for bug reports: open the site with ?debug=overflow to outline anything wider than the screen and list it at the bottom.
if (location.search.includes("debug=overflow")) {
  window.addEventListener("load", () => setTimeout(() => {
    const w = document.documentElement.clientWidth, bad: string[] = [];
    document.querySelectorAll<HTMLElement>("body *").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > w + 1 || r.left < -1) { el.style.outline = "2px solid red"; bad.push(`${el.tagName.toLowerCase()} ${String(el.className).slice(0, 50)} ${Math.round(r.left)}..${Math.round(r.right)}`); }
    });
    const box = document.createElement("pre");
    box.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;max-height:40vh;overflow:auto;margin:0;padding:8px;background:#000c;color:#fff;font:11px monospace;white-space:pre-wrap";
    box.textContent = `viewport ${w}px, page width ${document.documentElement.scrollWidth}px\n` + (bad.slice(0, 25).join("\n") || "no element is wider than the screen");
    document.body.appendChild(box);
  }, 1500));
}
// Safety net: translators and some extensions replace text nodes behind React's back, which makes React throw
// "insertBefore/removeChild: the node is not a child of this node". We skip such calls instead of crashing.
if (typeof Node === "function" && Node.prototype) {
  const remove = Node.prototype.removeChild, insert = Node.prototype.insertBefore;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) { console.warn("[Outpost Academy] skipped removeChild (page was changed by a translator or extension)"); return child; }
    return remove.call(this, child) as T;
  };
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) { console.warn("[Outpost Academy] skipped insertBefore (page was changed by a translator or extension)"); return node; }
    return insert.call(this, node, ref) as T;
  };
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>);
