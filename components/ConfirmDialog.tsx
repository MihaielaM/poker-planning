'use client';

import JesterHat from './JesterHat';

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onCancel}
    >
      <div
        className="bg-rd-surface border border-rd-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <JesterHat size={40} />
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        <p className="text-rd-subtle text-base leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="bg-rd-surface-2 hover:bg-rd-border border border-rd-border-2 text-rd-subtle hover:text-white px-4 py-2 rounded-lg text-base transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-rd-yellow hover:bg-rd-yellow-hover active:bg-rd-yellow-active text-rd-dark font-semibold px-4 py-2 rounded-lg text-base transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
