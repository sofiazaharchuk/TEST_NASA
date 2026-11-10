import React from "react";
import { createRoot } from "react-dom/client";
import "./i18n/index.ts";
import "./styles/index.css";
import "./styles/light.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./ui/ErrorBoundary.tsx";
import { installGlobalHandlers } from "./lib/resilience.ts";
installGlobalHandlers();
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
