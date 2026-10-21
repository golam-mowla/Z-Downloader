import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Terminal,
  ArrowRight,
  Plus,
  HelpCircle,
  Github,
  Bug,
  Info,
  RefreshCw,
  X,
  Zap,
  Radio,
  Cpu,
} from "lucide-react";
import { ToolVersionInfo } from "../types";

interface HeaderProps {
  tools: ToolVersionInfo[];
  appHasUpdate?: boolean;
  latestAppVersion?: string;
  onOpenUpdates: () => void;
  onAddNewDownload: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tools,
  appHasUpdate = false,
  latestAppVersion,
  onOpenUpdates,
  onAddNewDownload,
}) => {
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  const hasAnyEngineUpdate = tools.some((t) => t.hasUpdate);
  const showUpdateAlert = appHasUpdate || hasAnyEngineUpdate;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target as Node)) {
        setShowHelpMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-6 py-2.5 bg-[#070b14]/95 backdrop-blur-md border-b border-cyan-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] sticky top-0 z-30">
        {/* Left Side: Circular Dragon Logo + Brand + "+ Add" Button */}
        <div className="flex items-center gap-3">
          {/* Circular Dragon Icon */}
          <div className="relative shrink-0 flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md group-hover:bg-cyan-400/40 transition-all animate-pulse" />
            <img
              src="/dragon_full.png"
              alt="Z Downloader Dragon"
              className="w-10 h-10 rounded-full object-cover border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.6)] relative z-10 group-hover:scale-105 transition-transform"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                Z Downloader
              </h1>
              <span className="cyber-badge cyber-badge-cyan">
                v0.0.0
              </span>
              <span className="hidden md:inline-flex cyber-badge cyber-badge-pink">
                CYBERPUNK
              </span>
            </div>
            <p className="text-[11px] font-mono text-cyan-400/70 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Multi-Stream Media, Torrent &amp; IDM Interceptor</span>
            </p>
          </div>

          {/* Cyberpunk "+ Add" Button */}
          <button
            type="button"
            onClick={onAddNewDownload}
            className="ml-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black cyber-btn-cyan cursor-pointer"
            title="Add a new download anytime"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ ADD</span>
          </button>
        </div>

        {/* Right Side: IDM / Torrent Status Pills + Help Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden lg:flex items-center gap-2">
            <span className="cyber-badge cyber-badge-green flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              IDM INTERCEPTOR // ACTIVE
            </span>
            <span className="cyber-badge cyber-badge-yellow flex items-center gap-1">
              <Cpu className="w-3 h-3 text-amber-400" />
              TORRENT ENGINE // ONLINE
            </span>
          </div>

          {/* Engine Update Alert */}
          {showUpdateAlert ? (
            <button
              type="button"
              onClick={onOpenUpdates}
              title="Click to view update details"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black cyber-btn-pink animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>UPDATE AVAILABLE</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenUpdates}
              title="Engines operational"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-all"
            >
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>ENGINES OK</span>
            </button>
          )}

          {/* Help & About Dropdown Menu */}
          <div className="relative" ref={helpMenuRef}>
            <button
              type="button"
              onClick={() => setShowHelpMenu((v) => !v)}
              className="p-1.5 rounded-lg text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-500/30 transition-all"
              title="System Information & Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {showHelpMenu && (
              <div className="absolute right-0 mt-2 w-64 cyber-card p-2 z-50 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                <div className="px-3 py-2 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <img
                      src="/dragon_full.png"
                      alt="Dragon Icon"
                      className="w-6 h-6 rounded-full border border-cyan-400"
                    />
                    <div>
                      <div className="text-xs font-black text-cyan-300">Z Downloader</div>
                      <div className="text-[10px] font-mono text-cyan-400/60">Cyberpunk Edition v0.0.0</div>
                    </div>
                  </div>
                </div>

                <div className="py-1 text-xs font-mono space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowHelpMenu(false);
                      setShowAboutModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded text-left text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>System Architecture</span>
                  </button>

                  <a
                    href="https://github.com/golam-mowla/Z-Downloader"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded text-left text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-pink-400" />
                    <span>GitHub Repository</span>
                  </a>

                  <a
                    href="https://github.com/golam-mowla/Z-Downloader/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded text-left text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                  >
                    <Bug className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Report Issue</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg cyber-card p-6 border border-cyan-500/60 shadow-[0_0_30px_rgba(0,240,255,0.25)] relative">
            <button
              type="button"
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src="/dragon_full.png"
                alt="Dragon Icon"
                className="w-14 h-14 rounded-full border-2 border-cyan-400 shadow-[0_0_16px_rgba(0,240,255,0.5)]"
              />
              <div>
                <h2 className="text-lg font-black tracking-wider text-cyan-300">Z DOWNLOADER</h2>
                <p className="text-xs font-mono text-pink-400">Cyberpunk Edition // Build 0.0.0</p>
                <p className="text-[11px] font-mono text-slate-400">Developed by Golam Mowla</p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <p>
                Z Downloader is a high-speed, lightweight Windows media and BitTorrent downloader powered by Tauri 2, Rust, and WebView2.
              </p>
              <div className="p-3 bg-black/50 border border-cyan-500/30 rounded-lg space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Backend:</span>
                  <span className="text-cyan-300 font-bold">Native Rust + Tauri 2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frontend:</span>
                  <span className="text-cyan-300 font-bold">React 18 + TailwindCSS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Torrent Engine:</span>
                  <span className="text-yellow-400 font-bold">aria2c BitTorrent + DHT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Media Engine:</span>
                  <span className="text-pink-400 font-bold">yt-dlp + FFmpeg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IDM Interceptor:</span>
                  <span className="text-emerald-400 font-bold">Local Bridge (Port 9777)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-2 cyber-btn-cyan text-xs font-black rounded-lg"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
