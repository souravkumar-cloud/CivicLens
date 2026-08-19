"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/v1";

type Source = {
  source_id: string | number;
  source_url: string;
  source: string;
  chunks: number;
  page?: number;
};

interface SourcesResponse {
  sources?: Source[];
  detail?: string;
}

interface IngestResponse {
  data?: {
    chunks?: number;
  };
  detail?: string;
}

interface AskResponse {
  answer?: string;
  sources?: Source[];
  detail?: string;
}

interface KeyboardEventLike {
  key: string;
  shiftKey: boolean;
  preventDefault(): void;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const [error, setError] = useState("");
  const [ingestMessage, setIngestMessage] = useState("");

  const [url, setUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");

  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const [proofScrollsOpen, setProofScrollsOpen] = useState(true);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // ============================================================
  // LOAD SOURCES
  // ============================================================

  async function loadSources() {
    setLoadingSources(true);

    try {
      const response = await fetch(`${API_URL}/sources`);

      const data: SourcesResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load sources.");
      }

      setSources(data.sources || []);

      // Remove selected sources that no longer exist
      setSelectedSources((current) =>
        current.filter((url) =>
          (data.sources || []).some((source: Source) => source.source_url === url)
        )
      );
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingSources(false);
    }
  }

  // ============================================================
  // LOAD SOURCES WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    loadSources();
  }, []);

  // ============================================================
  // TOGGLE SOURCE
  // ============================================================

  function toggleSource(sourceUrl: string) {
    setSelectedSources((current) => {
      if (current.includes(sourceUrl)) {
        return current.filter((url) => url !== sourceUrl);
      }

      return [...current, sourceUrl];
    });
  }

  // ============================================================
  // REMOVE SOURCE
  // ============================================================

  async function removeSource(sourceId: string | number) {
    const confirmed = window.confirm("Remove this source from CivicLens?");

    if (!confirmed) {
      return;
    }

    setError("");
    setIngestMessage("");

    try {
      const response = await fetch(`${API_URL}/sources/${sourceId}`, {
        method: "DELETE",
      });

      const data: SourcesResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete source.");
      }

      setIngestMessage("Source removed.");

      await loadSources();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  // ============================================================
  // INGEST URL
  // ============================================================

  async function ingestURL() {
    if (!url.trim()) {
      return;
    }

    setIngesting(true);
    setIngestMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/ingest-url`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          url: url.trim(),
          title: urlTitle.trim() || "Government Source",
        }),
      });

      const data: IngestResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to ingest URL.");
      }

      const indexedChunks = data.data?.chunks || 0;

      setIngestMessage(`Sealed. ${indexedChunks} chunks indexed.`);

      setUrl("");
      setUrlTitle("");

      await loadSources();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIngesting(false);
    }
  }

  // ============================================================
  // ASK CIVICLENS
  // ============================================================

  async function askCivicLens() {
    if (!question.trim()) {
      return;
    }

    setLoading(true);
    setAnswer("");
    setSources([]);
    setError("");

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          question: question.trim(),

          // If no source is selected,
          // search the entire knowledge base.
          source_urls: selectedSources.length > 0 ? selectedSources : null,
        }),
      });

      const data: AskResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setAnswer(data.answer || "");
      setSources(data.sources || []);
      setProofScrollsOpen(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ENTER KEY HANDLER
  // ============================================================

  function handleQuestionKeyDown(event: KeyboardEventLike) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askCivicLens();
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-[#0B0A10] text-[#EFE7D8] [font-family:var(--font-body)]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Yuji+Syuku&family=Zen+Kaku+Gothic+New:wght@500;700;900&family=Noto+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
        :root {
          --font-brush: 'Yuji Syuku', serif;
          --font-display: 'Zen Kaku Gothic New', sans-serif;
          --font-body: 'Noto Sans', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
          --ink: #0B0A10;
          --panel: #15131C;
          --line: #2A2632;
          --orange: #FF7A1A;
          --chakra: #3FC1FF;
          --seal: #E63946;
          --leaf: #4FB876;
          --parchment: #F1E5C6;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stampIn {
          from { opacity: 0; transform: scale(1.4) rotate(-14deg); }
          to { opacity: 1; transform: scale(1) rotate(-6deg); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(14px, -10px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-fade-up { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-stamp { animation: stampIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }

        .halftone { position: relative; isolation: isolate; }
        .halftone::before {
          content: "";
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,122,26,0.22) 1px, transparent 1.3px);
          background-size: 9px 9px;
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }
        .halftone > * { position: relative; z-index: 1; }

        .panel-cut {
          clip-path: polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px);
        }
        .panel-cut-sm {
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }

        .chakra-ring {
          width: 16px; height: 16px; border-radius: 9999px;
          border: 3px solid rgba(255,255,255,0.15);
          border-top-color: var(--chakra);
          border-right-color: var(--orange);
          animation: spin 0.7s linear infinite;
        }

        .seal-stamp {
          border: 2px solid var(--seal);
          color: var(--seal);
          transform: rotate(-6deg);
        }

        .brush-underline {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 18' preserveAspectRatio='none'%3E%3Cpath d='M2 12 C 40 4, 90 16, 140 8 S 200 4, 218 10' stroke='%23FF7A1A' stroke-width='6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: 100% 100%;
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      {/* ======================================================
          AMBIENT INK WASH
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-70">
        <div
          className="absolute -left-24 top-10 h-96 w-96 rounded-full blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(255,122,26,0.16), transparent 70%)", animation: "drift 16s ease-in-out infinite" }}
        />
        <div
          className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(63,193,255,0.14), transparent 70%)", animation: "drift 20s ease-in-out infinite reverse" }}
        />
      </div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="relative border-b-2 border-[#2A2632] bg-[#0B0A10]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="panel-cut-sm flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[var(--orange)] bg-[var(--orange)]/15 text-lg font-black text-[var(--orange)] [font-family:var(--font-display)]"
            >
              忍
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight [font-family:var(--font-display)]">
                CivicLens
              </h1>
              <p className="text-sm text-[#A79E8E]">Government intel, shinobi-clear.</p>
            </div>
          </div>

          <div className="seal-stamp panel-cut-sm inline-flex items-center gap-2 self-start bg-[#15131C] px-4 py-2 text-xs font-bold uppercase tracking-wide sm:self-auto">
            <span
              className="h-2 w-2 rounded-full bg-[var(--seal)]"
              style={{ animation: "flicker 1.6s ease-in-out infinite" }}
            />
            Dojo online
          </div>
        </div>
      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <section className="relative mx-auto max-w-4xl px-5 py-14 sm:px-6 sm:py-20">
        {/* HERO */}

        <div className="animate-fade-up text-center">
          <div className="mb-5 inline-flex items-center gap-2 border-2 border-[var(--chakra)]/50 bg-[var(--chakra)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#9FE0FF]">
            Government Information RAG
          </div>

          <h2 className="text-4xl font-black leading-[1.05] tracking-tight [font-family:var(--font-display)] sm:text-6xl">
            Ask{" "}
            <span className="brush-underline inline-block pb-2 [font-family:var(--font-brush)] font-normal text-[var(--orange)]">
              CivicLens
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base text-[#A79E8E] sm:text-lg">
            Seal a government source into the archive. Ask a real question about
            schemes and policy. Get an answer that's stamped and sealed with proof.
          </p>
        </div>

        {/* ==================================================
            SELECTED SOURCE MESSAGE
        ================================================== */}

        {selectedSources.length > 0 && (
          <div className="animate-stamp mt-5 inline-flex items-center gap-2 border-2 border-[var(--orange)]/40 bg-[var(--orange)]/10 px-4 py-2 text-sm text-[#FFC898]">
            Focusing chakra on{" "}
            <span className="font-bold text-[var(--parchment)]">{selectedSources.length}</span>{" "}
            scroll{selectedSources.length > 1 ? "s" : ""}
          </div>
        )}

        {/* ==================================================
            QUESTION BOX
        ================================================== */}

        <div
          className="halftone panel-cut animate-fade-up mt-8 border-2 border-[#2A2632] bg-[#15131C] p-5 transition-colors duration-300 focus-within:border-[var(--orange)] sm:p-6"
          style={{ animationDelay: "120ms" }}
        >
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleQuestionKeyDown}
            placeholder="Example: What is the income limit for this scheme?"
            className="min-h-32 w-full resize-none bg-transparent text-lg text-[#EFE7D8] outline-none placeholder:text-[#5C5568]"
          />

          <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t-2 border-dashed border-[#2A2632] pt-4 sm:flex-row sm:items-center">
            <p className="text-xs text-[#5C5568] sm:text-sm">
              Press <kbd className="rounded border border-[#2A2632] bg-[#0B0A10] px-1.5 py-0.5 [font-family:var(--font-mono)]">Enter</kbd> to ask · <kbd className="rounded border border-[#2A2632] bg-[#0B0A10] px-1.5 py-0.5 [font-family:var(--font-mono)]">Shift + Enter</kbd> for a new line
            </p>

            <button
              onClick={askCivicLens}
              disabled={loading || !question.trim()}
              className="panel-cut-sm flex w-full items-center justify-center gap-2 border-2 border-[var(--orange)] bg-[var(--orange)] px-6 py-3 font-bold text-[#0B0A10] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto"
            >
              {loading ? (
                <>
                  <span className="chakra-ring" />
                  Channeling...
                </>
              ) : (
                "Ask CivicLens →"
              )}
            </button>
          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="animate-stamp mt-6 border-2 border-[var(--seal)]/50 bg-[var(--seal)]/10 p-5 text-[#FFB3BA]">
            <p className="font-bold text-[var(--seal)]">Something went wrong</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* ==================================================
            ANSWER
        ================================================== */}

        {answer && (
          <div className="animate-fade-up mt-10">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full bg-[var(--leaf)]"
                style={{ animation: "flicker 1.6s ease-in-out infinite" }}
              />
              <h3 className="text-lg font-black [font-family:var(--font-display)] sm:text-xl">
                CivicLens Answer
              </h3>
              <span className="seal-stamp ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                verified
              </span>
            </div>

            <div className="panel-cut border-2 border-[var(--orange)]/40 bg-gradient-to-br from-[#15131C] to-[#1C1526] p-6 sm:p-7">
              <p className="whitespace-pre-wrap text-base leading-8 text-[#F3ECDD] sm:text-lg">
                {answer}
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            ADD GOVERNMENT SOURCE
        ================================================== */}

        <div
          className="halftone panel-cut animate-fade-up mt-12 border-2 border-[#2A2632] bg-[#15131C] p-6 transition-colors duration-300 hover:border-[var(--orange)]/50 sm:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="[font-family:var(--font-brush)] text-2xl text-[var(--orange)]">巻</span>
            <h3 className="text-lg font-black [font-family:var(--font-display)] sm:text-xl">
              Seal a New Scroll
            </h3>
          </div>

          <p className="mt-2 text-sm text-[#A79E8E]">
            Point CivicLens at an official government webpage or PDF and it'll index it into the archive.
          </p>

          {/* URL */}

          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.gov.in/scheme"
            className="mt-5 w-full rounded-lg border-2 border-[#2A2632] bg-[#0B0A10] px-4 py-3 text-[#EFE7D8] placeholder:text-[#5C5568] outline-none transition-colors duration-200 focus:border-[var(--orange)]"
          />

          {/* TITLE */}

          <input
            value={urlTitle}
            onChange={(event) => setUrlTitle(event.target.value)}
            placeholder="Source title (optional)"
            className="mt-3 w-full rounded-lg border-2 border-[#2A2632] bg-[#0B0A10] px-4 py-3 text-[#EFE7D8] placeholder:text-[#5C5568] outline-none transition-colors duration-200 focus:border-[var(--orange)]"
          />

          {/* ADD BUTTON */}

          <button
            onClick={ingestURL}
            disabled={ingesting || !url.trim()}
            className="panel-cut-sm mt-5 flex items-center gap-2 border-2 border-[var(--chakra)] bg-[var(--chakra)] px-6 py-3 font-bold text-[#0B0A10] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {ingesting ? (
              <>
                <span className="chakra-ring" />
                Sealing scroll...
              </>
            ) : (
              "Add source"
            )}
          </button>

          {/* SUCCESS MESSAGE */}

          {ingestMessage && (
            <p className="animate-stamp mt-4 inline-flex items-center gap-2 border-2 border-[var(--leaf)]/40 bg-[var(--leaf)]/10 px-3 py-2 text-sm font-medium text-[var(--leaf)]">
              ✓ {ingestMessage}
            </p>
          )}
        </div>

        {/* ==================================================
            SOURCES (dropdown)
        ================================================== */}

        {sources.length > 0 && answer && (
          <div className="animate-fade-up mt-6 border-2 border-[#2A2632] bg-[#15131C]">
            <button
              onClick={() => setProofScrollsOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left sm:px-7"
            >
              <h3 className="text-base font-black [font-family:var(--font-display)] sm:text-lg">
                Proof Scrolls
              </h3>

              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`shrink-0 text-[var(--orange)] transition-transform duration-200 ${
                  proofScrollsOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {proofScrollsOpen && (
              <div className="space-y-3 border-t-2 border-dashed border-[#2A2632] px-6 py-6 sm:px-7">
                {sources.map((source, index) => (
                  <div
                    key={`${source.source}-${source.page}-${index}`}
                    className="panel-cut-sm border-2 border-[#2A2632] bg-[#0B0A10] px-5 py-4 transition-colors duration-150 hover:border-[var(--chakra)]/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* SOURCE DETAILS */}
                      <div className="min-w-0">
                        <p className="font-semibold text-[#EFE7D8]">{source.source}</p>

                        {source.source_url && (
                          <a
                            href={source.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-sm text-[#9FE0FF] transition-colors hover:text-[var(--orange)] hover:underline"
                          >
                            View official source ↗
                          </a>
                        )}

                        <p className="mt-2 text-xs text-[#5C5568]">
                          Retrieved from CivicLens knowledge base
                        </p>
                      </div>

                      {/* PAGE */}
                      <span className="shrink-0 rounded border border-[#2A2632] bg-[#15131C] px-3 py-2 text-sm [font-family:var(--font-mono)] text-[#A79E8E]">
                        p.{source.page}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            KNOWLEDGE SOURCES (dropdown)
        ================================================== */}

        <div className="animate-fade-up mt-6 border-2 border-[#2A2632] bg-[#15131C]">
          <button
            onClick={() => setArchiveOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left sm:px-7"
          >
            <div>
              <h3 className="text-base font-black [font-family:var(--font-display)] sm:text-lg">
                Scroll Archive
              </h3>
              <p className="mt-1 text-sm text-[#A79E8E]">
                Tap a scroll to search just that source.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="rounded border-2 border-[#2A2632] bg-[#0B0A10] px-3 py-1 text-sm font-bold [font-family:var(--font-mono)] text-[#9FE0FF]">
                {sources.length}
              </span>

              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`text-[var(--orange)] transition-transform duration-200 ${
                  archiveOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {archiveOpen && (
            <div className="border-t-2 border-dashed border-[#2A2632] px-6 py-6 sm:px-7">
              {/* LOADING */}

              {loadingSources ? (
                <div className="space-y-3">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse border-2 border-[#2A2632] bg-[#1C1A24]"
                    />
                  ))}
                </div>
              ) : sources.length === 0 ? (
                /* EMPTY */
                <div className="border-2 border-dashed border-[#2A2632] px-5 py-8 text-center">
                  <p className="text-[#5C5568]">No scrolls sealed yet — add a source above to begin.</p>
                </div>
              ) : (
                /* SOURCE LIST */
                <div className="space-y-3">
                  {sources.map((source) => {
                    const isSelected = selectedSources.includes(source.source_url);

                    return (
                      <div
                        key={source.source_id}
                        onClick={() => toggleSource(source.source_url)}
                        className={`panel-cut-sm group relative cursor-pointer border-2 p-5 transition-all duration-200 ${
                          isSelected
                            ? "border-[var(--leaf)] bg-[var(--leaf)]/[0.07]"
                            : "border-[#2A2632] bg-[#0B0A10] hover:border-[var(--orange)]/60"
                        }`}
                      >
                        {isSelected && (
                          <span
                            className="seal-stamp animate-stamp absolute -right-2 -top-2 rounded-full border-[var(--leaf)] bg-[#0B0A10] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--leaf)]"
                          >
                            ✓ selected
                          </span>
                        )}

                        <div className="flex items-start justify-between gap-4">
                          {/* LEFT */}
                          <div className="flex min-w-0 gap-4">
                            {/* CHECKBOX */}
                            <div
                              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-150 ${
                                isSelected
                                  ? "border-[var(--leaf)] bg-[var(--leaf)] text-[#0B0A10]"
                                  : "border-[#3A3546] text-transparent"
                              }`}
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>

                            {/* SOURCE INFO */}
                            <div className="min-w-0">
                              <h4 className="font-semibold text-[#EFE7D8]">{source.source}</h4>
                              <p className="mt-1 truncate text-sm text-[#5C5568] group-hover:text-[#8A8296]">
                                {source.source_url}
                              </p>
                              <p className="mt-2 inline-block rounded bg-[#1C1A24] px-2 py-0.5 text-xs [font-family:var(--font-mono)] text-[#A79E8E]">
                                {source.chunks} chunks
                              </p>
                            </div>
                          </div>

                          {/* REMOVE */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSource(source.source_id);
                            }}
                            className="shrink-0 rounded border-2 border-[var(--seal)]/30 px-3 py-2 text-sm font-medium text-[var(--seal)] transition-colors duration-150 hover:border-[var(--seal)] hover:bg-[var(--seal)]/10"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="relative border-t-2 border-[#2A2632] py-8 text-center text-sm text-[#5C5568]">
        CivicLens · AI-powered civic information
      </footer>
    </main>
  );
}