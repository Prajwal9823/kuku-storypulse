'use client';

import React, { useState } from 'react';
import {
  Upload,
  X,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { uploadScreenplayFile } from '@/lib/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [showTitle, setShowTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [stage, setStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a screenplay ZIP or TXT file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      setStage('Stage 1/5: Ingesting screenplay pack & parsing timestamps...');
      await new Promise((r) => setTimeout(r, 600));

      setStage('Stage 2/5: Constructing narrative knowledge graph...');
      await new Promise((r) => setTimeout(r, 500));

      setStage('Stage 3/5: Generating multi-resolution sliding windows (20-60s)...');
      await new Promise((r) => setTimeout(r, 600));

      setStage('Stage 4/5: Calculating 7-D Promo DNA scores & MMR diversity reranking...');
      const formData = new FormData();
      formData.append('file', file);
      if (showTitle.trim()) {
        formData.append('show_name', showTitle.trim());
      }

      await uploadScreenplayFile(formData);

      setStage('Stage 5/5: Executing quality audit & dialogue traceability...');
      await new Promise((r) => setTimeout(r, 400));

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process screenplay.');
    } finally {
      setIsUploading(false);
      setStage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-surface-border p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-glow/20 text-violet-light border border-violet-glow/30">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload New Screenplay</h2>
              <p className="text-xs text-slate-400">
                Process an entirely new microdrama show ZIP during interviews
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Show Title Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Show Title (Optional):
          </label>
          <input
            type="text"
            placeholder="e.g. The Billionaire's Secret Bride"
            value={showTitle}
            onChange={(e) => setShowTitle(e.target.value)}
            disabled={isUploading}
            className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subtle border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-violet-glow disabled:opacity-50"
          />
        </div>

        {/* File Dropzone */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Screenplay Archive (.ZIP) or Episode (.TXT):
          </label>
          <div className="p-6 border-2 border-dashed border-surface-border rounded-xl text-center space-y-2 hover:border-violet-glow transition-colors bg-surface-subtle/50">
            <FileArchive className="w-8 h-8 text-violet-light mx-auto" />
            <div className="text-xs text-slate-300 font-medium">
              {file ? file.name : 'Choose a ZIP or TXT screenplay file'}
            </div>
            <p className="text-[11px] text-slate-500">
              Compatible with Kuku TV screenplay format with MM:SS.xx timestamps
            </p>
            <input
              type="file"
              accept=".zip,.txt"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-surface text-slate-200 border border-surface-border text-xs font-semibold cursor-pointer hover:bg-surface-hover transition-colors"
            >
              Browse Files
            </label>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Stage Indicator */}
        {isUploading && (
          <div className="p-3.5 rounded-lg bg-violet-glow/15 border border-violet-glow/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-light">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{stage}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-border overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-accent to-coral-accent w-3/4 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={isUploading || !file}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-glow to-violet-accent hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-violet-glow/25 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Processing Pipeline...' : 'Run Promo Discovery'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

