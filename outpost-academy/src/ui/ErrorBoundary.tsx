import { Component, type ReactNode } from "react";
import i18n from "../i18n/index.ts";
import { useStore } from "../store.ts";
import { isChunkError, reloadOnce } from "../lib/resilience.ts";

/** Last line of defence: if any screen crashes, the player sees a friendly page with a way back instead of an empty background. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("[Outpost Academy] screen crashed:", error, info.componentStack);
    if (isChunkError(error)) reloadOnce();
  }
  back = () => { useStore.getState().recover(); this.setState({ error: null }); };
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const t = (k: string) => i18n.t(k);
    return (
      <div role="alert" className="mx-auto grid min-h-[70dvh] max-w-md place-items-center px-4 text-center">
        <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-xl">
          <p className="text-6xl" aria-hidden>🛰️</p>
          <h1 className="mt-3 font-head text-2xl font-extrabold">{t("error.title")}</h1>
          <p className="mt-2 text-slate-300">{t("error.text")}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button className="min-h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 font-semibold text-white" onClick={this.back}>{t("error.back")}</button>
            <button className="min-h-12 rounded-2xl border border-white/20 px-5 font-medium" onClick={() => location.reload()}>{t("error.reload")}</button>
          </div>
          <details className="mt-4 text-left text-xs text-slate-400"><summary className="cursor-pointer">{t("error.details")}</summary><pre className="mt-2 whitespace-pre-wrap break-words">{String(error?.message ?? error)}</pre></details>
        </div>
      </div>
    );
  }
}
