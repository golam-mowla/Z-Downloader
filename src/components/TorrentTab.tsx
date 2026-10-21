import React, { useState } from "react";
import {
  Download,
  Play,
  Pause,
  Trash2,
  FolderOpen,
  Folder,
  Radio,
  FileBox,
  Zap,
  HardDrive,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { TorrentItem } from "../types";

interface TorrentTabProps {
  torrents: TorrentItem[];
  defaultSaveFolder: string;
  onStartTorrent: (magnetOrTorrent: string, saveFolder: string) => void;
  onBrowseFolder: () => Promise<string | null>;
  onPauseTorrent: (id: string) => void;
  onResumeTorrent: (id: string) => void;
  onDeleteTorrent: (id: string) => void;
  onOpenFolder: (path: string) => void;
}

export const TorrentTab: React.FC<TorrentTabProps> = ({
  torrents,
  defaultSaveFolder,
  onStartTorrent,
  onBrowseFolder,
  onPauseTorrent,
  onResumeTorrent,
  onDeleteTorrent,
  onOpenFolder,
}) => {
  const [magnetInput, setMagnetInput] = useState("");
  const [saveFolder, setSaveFolder] = useState(defaultSaveFolder);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddTorrent = () => {
    const trimmed = magnetInput.trim();
    if (!trimmed) return;
    onStartTorrent(trimmed, saveFolder || defaultSaveFolder);
    setMagnetInput("");
  };

  const handleSelectFolder = async () => {
    const chosen = await onBrowseFolder();
    if (chosen) setSaveFolder(chosen);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCount = torrents.filter((t) => t.status === "downloading").length;

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Add Magnet Card */}
      <div className="cyber-card p-4 sm:p-5 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-yellow-400 animate-pulse" />
            <h2 className="text-sm font-black font-mono tracking-wider text-cyan-300 uppercase">
              qBit Torrent Engine // Magnet &amp; Torrent Streamer
            </h2>
          </div>
          <span className="cyber-badge cyber-badge-yellow">
            DHT &amp; PEX ENABLED
          </span>
        </div>

        {/* Magnet / Torrent Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
              MAGNET URI / TORRENT FILE PATH:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={magnetInput}
                onChange={(e) => setMagnetInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTorrent()}
                placeholder="magnet:?xt=urn:btih:..."
                className="flex-1 cyber-input px-3 py-2 text-xs font-mono placeholder:text-slate-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTorrent}
                disabled={!magnetInput.trim()}
                className="px-4 py-2 cyber-btn-cyan text-xs font-black rounded-lg flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>START TORRENT</span>
              </button>
            </div>
          </div>

          {/* Destination Folder Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cyan-500/10 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save Folder:</span>
              <span className="text-slate-200 truncate max-w-[280px] sm:max-w-md">
                {saveFolder || defaultSaveFolder}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSelectFolder}
              className="px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 hover:border-cyan-400 transition-all flex items-center gap-1"
            >
              <Folder className="w-3 h-3" />
              <span>Change Folder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Torrent Queue Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="cyber-card p-3 border-cyan-500/30">
          <div className="text-[10px] font-mono text-cyan-400/80">ACTIVE TORRENTS</div>
          <div className="text-lg font-black text-cyan-300 mt-1">{activeCount}</div>
        </div>
        <div className="cyber-card p-3 border-cyan-500/30">
          <div className="text-[10px] font-mono text-yellow-400/80">TOTAL IN QUEUE</div>
          <div className="text-lg font-black text-yellow-300 mt-1">{torrents.length}</div>
        </div>
        <div className="cyber-card p-3 border-cyan-500/30">
          <div className="text-[10px] font-mono text-emerald-400/80">BITTORRENT PROTOCOL</div>
          <div className="text-lg font-black text-emerald-300 mt-1">v1 + v2 Hybrid</div>
        </div>
        <div className="cyber-card p-3 border-cyan-500/30">
          <div className="text-[10px] font-mono text-pink-400/80">PEER ENCRYPTION</div>
          <div className="text-lg font-black text-pink-300 mt-1">High (Encrypted)</div>
        </div>
      </div>

      {/* Torrents List */}
      <div className="cyber-card p-4 border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
          <div className="text-xs font-mono font-bold text-slate-300">
            TORRENT DOWNLOAD QUEUE ({torrents.length})
          </div>
        </div>

        {torrents.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-slate-500 space-y-2">
            <FileBox className="w-8 h-8 mx-auto text-cyan-500/40" />
            <p>No active BitTorrent transfers in queue.</p>
            <p className="text-[11px] text-slate-600">
              Paste a magnet link or .torrent above to initiate multi-peer downloading!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {torrents.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-black/40 border border-cyan-500/25 rounded-lg hover:border-cyan-500/50 transition-all space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-bold text-cyan-300 truncate">
                      {item.name || item.magnetOrTorrent}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
                      {item.downloadSpeed && (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <ArrowDownCircle className="w-3 h-3" />
                          {item.downloadSpeed}
                        </span>
                      )}
                      {item.uploadSpeed && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ArrowUpCircle className="w-3 h-3" />
                          {item.uploadSpeed}
                        </span>
                      )}
                      {item.eta && <span className="text-slate-400">ETA: {item.eta}</span>}
                      {item.totalSize && <span>Size: {item.totalSize}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.status === "downloading" ? (
                      <button
                        type="button"
                        onClick={() => onPauseTorrent(item.id)}
                        className="p-1.5 rounded bg-yellow-950/40 border border-yellow-500/30 text-yellow-300 hover:border-yellow-400"
                        title="Pause Torrent"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onResumeTorrent(item.id)}
                        className="p-1.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400"
                        title="Resume Torrent"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenFolder(item.saveFolder)}
                      className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-400"
                      title="Open Download Folder"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.magnetOrTorrent, item.id)}
                      className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-400"
                      title="Copy Magnet Link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTorrent(item.id)}
                      className="p-1.5 rounded bg-red-950/40 border border-red-500/30 text-red-400 hover:border-red-400"
                      title="Delete from Queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-cyan-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{item.progress.toFixed(1)}%</span>
                  <span className="uppercase text-cyan-400">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
