"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/v1";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const [error, setError] = useState("");
  const [ingestMessage, setIngestMessage] = useState("");

  const [url, setUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");

  const [selectedSources, setSelectedSources] = useState([]);

  // ============================================================
  // LOAD SOURCES
  // ============================================================

  async function loadSources() {
    setLoadingSources(true);

    try {
      const response = await fetch(`${API_URL}/sources`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load sources."
        );
      }

      setSources(data.sources || []);

      // Remove selected sources that no longer exist
      setSelectedSources((current) =>
        current.filter((url) =>
          (data.sources || []).some(
            (source) => source.source_url === url
          )
        )
      );
    } catch (error) {
      setError(error.message);
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

  function toggleSource(sourceUrl) {
    setSelectedSources((current) => {
      if (current.includes(sourceUrl)) {
        return current.filter(
          (url) => url !== sourceUrl
        );
      }

      return [...current, sourceUrl];
    });
  }

  // ============================================================
  // REMOVE SOURCE
  // ============================================================

  async function removeSource(sourceId) {
    const confirmed = window.confirm(
      "Remove this source from CivicLens?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIngestMessage("");

    try {
      const response = await fetch(
        `${API_URL}/sources/${sourceId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to delete source."
        );
      }

      setIngestMessage(
        "Source removed successfully."
      );

      await loadSources();
    } catch (error) {
      setError(error.message);
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
      const response = await fetch(
        `${API_URL}/ingest-url`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            url: url.trim(),
            title:
              urlTitle.trim() ||
              "Government Source",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to ingest URL."
        );
      }

      const indexedChunks =
        data.data?.chunks || 0;

      setIngestMessage(
        `Source added successfully. ${indexedChunks} chunks indexed.`
      );

      setUrl("");
      setUrlTitle("");

      await loadSources();
    } catch (error) {
      setError(error.message);
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
      const response = await fetch(
        `${API_URL}/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: question.trim(),

            // If no source is selected,
            // search the entire knowledge base.
            source_urls:
              selectedSources.length > 0
                ? selectedSources
                : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Something went wrong."
        );
      }

      setAnswer(data.answer || "");
      setSources(data.sources || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ENTER KEY HANDLER
  // ============================================================

  function handleQuestionKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askCivicLens();
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-800">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              CivicLens
            </h1>

            <p className="text-sm text-slate-400">
              Understand government information clearly.
            </p>
          </div>

          <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
            AI Civic Assistant
          </div>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <section className="mx-auto max-w-4xl px-6 py-20">

        {/* HERO */}

        <div className="text-center">

          <div className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            Government Information RAG
          </div>

          <h2 className="text-5xl font-bold tracking-tight">
            Ask CivicLens
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Ask questions about government schemes,
            policies and official documents.
          </p>

        </div>


        {/* ==================================================
            ADD GOVERNMENT SOURCE
        ================================================== */}

        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold">
            Add Government Source
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Add an official government webpage or
            PDF to the CivicLens knowledge base.
          </p>


          {/* URL */}

          <input
            value={url}
            onChange={(event) =>
              setUrl(event.target.value)
            }
            placeholder="https://example.gov.in/scheme"
            className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-500"
          />


          {/* TITLE */}

          <input
            value={urlTitle}
            onChange={(event) =>
              setUrlTitle(event.target.value)
            }
            placeholder="Source title (optional)"
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-500"
          />


          {/* ADD BUTTON */}

          <button
            onClick={ingestURL}
            disabled={
              ingesting ||
              !url.trim()
            }
            className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ingesting
              ? "Adding Source..."
              : "Add Source"}
          </button>


          {/* SUCCESS MESSAGE */}

          {ingestMessage && (
            <p className="mt-4 text-sm text-green-400">
              {ingestMessage}
            </p>
          )}

        </div>


        {/* ==================================================
            KNOWLEDGE SOURCES
        ================================================== */}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-xl font-semibold">
                Knowledge Sources
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Government sources currently indexed
                by CivicLens.
              </p>

            </div>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
              {sources.length}
            </span>

          </div>


          {/* LOADING */}

          {loadingSources ? (

            <p className="mt-6 text-slate-500">
              Loading sources...
            </p>

          ) : sources.length === 0 ? (

            /* EMPTY */

            <p className="mt-6 text-slate-500">
              No sources have been added yet.
            </p>

          ) : (

            /* SOURCE LIST */

            <div className="mt-6 space-y-3">

              {sources.map((source) => {

                const isSelected =
                  selectedSources.includes(
                    source.source_url
                  );

                return (

                  <div
                    key={source.source_id}
                    className={`rounded-xl border p-5 transition ${
                      isSelected
                        ? "border-blue-500/50 bg-blue-500/5"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >

                    <div className="flex items-start justify-between gap-4">

                      {/* LEFT */}

                      <div className="flex min-w-0 gap-4">

                        {/* CHECKBOX */}

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            toggleSource(
                              source.source_url
                            )
                          }
                          className="mt-1 h-4 w-4 cursor-pointer"
                        />


                        {/* SOURCE INFO */}

                        <div className="min-w-0">

                          <h4 className="font-semibold">
                            {source.source}
                          </h4>

                          <p className="mt-1 break-all text-sm text-slate-500">
                            {source.source_url}
                          </p>

                          <p className="mt-2 text-sm text-slate-400">
                            {source.chunks} chunks indexed
                          </p>

                        </div>

                      </div>


                      {/* REMOVE */}

                      <button
                        onClick={() =>
                          removeSource(
                            source.source_id
                          )
                        }
                        className="shrink-0 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
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


        {/* ==================================================
            SELECTED SOURCE MESSAGE
        ================================================== */}

        {selectedSources.length > 0 && (

          <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">

            <p className="text-sm text-blue-300">

              Searching{" "}

              <span className="font-semibold">
                {selectedSources.length}
              </span>{" "}

              selected source
              {selectedSources.length > 1
                ? "s"
                : ""}.

            </p>

          </div>

        )}


        {/* ==================================================
            QUESTION BOX
        ================================================== */}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={
              handleQuestionKeyDown
            }
            placeholder="Example: What is the income limit for this scheme?"
            className="min-h-32 w-full resize-none bg-transparent text-lg outline-none placeholder:text-slate-600"
          />


          <div className="mt-4 flex items-center justify-between">

            <p className="text-sm text-slate-500">
              Press Enter to ask • Shift + Enter for a new line
            </p>


            <button
              onClick={askCivicLens}
              disabled={
                loading ||
                !question.trim()
              }
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Searching..."
                : "Ask CivicLens"}
            </button>

          </div>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">

            <p className="font-medium">
              Something went wrong
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

          </div>

        )}


        {/* ==================================================
            ANSWER
        ================================================== */}

        {answer && (

          <div className="mt-10">

            <div className="mb-4 flex items-center gap-3">

              <div className="h-3 w-3 rounded-full bg-green-500" />

              <h3 className="text-xl font-semibold">
                CivicLens Answer
              </h3>

            </div>


            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

              <p className="whitespace-pre-wrap text-lg leading-8 text-slate-200">
                {answer}
              </p>

            </div>

          </div>

        )}


        {/* ==================================================
            SOURCES
        ================================================== */}

        {sources.length > 0 && answer && (

          <div className="mt-8">

            <h3 className="mb-4 text-lg font-semibold">
              Sources
            </h3>


            <div className="space-y-3">

              {sources.map(
                (source, index) => (

                  <div
                    key={`${source.source}-${source.page}-${index}`}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4"
                  >

                    <div className="flex items-start justify-between gap-4">

                      {/* SOURCE DETAILS */}

                      <div className="min-w-0">

                        <p className="font-medium">
                          {source.source}
                        </p>


                        {source.source_url && (

                          <a
                            href={source.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-sm text-blue-400 hover:underline"
                          >
                            View official source ↗
                          </a>

                        )}


                        <p className="mt-2 text-sm text-slate-500">
                          Retrieved from CivicLens knowledge base
                        </p>

                      </div>


                      {/* PAGE */}

                      <span className="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">
                        Page {source.page}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </section>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">

        CivicLens • AI-powered civic information

      </footer>

    </main>
  );
}