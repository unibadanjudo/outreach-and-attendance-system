import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { RefreshCw } from 'lucide-react';
import { useCreateOutreach } from '../../hooks/useOutreach';
import { formatPhone, formatWhatsAppUrl } from '../../utils/formatters';
import { OutreachFormFields } from './OutreachFormFields';
import type { ContactMethod, OutreachQueueItem, OutreachStatus } from '../../types';

interface OutreachActionConsoleProps {
  item: OutreachQueueItem | null;
  onSuccess?: () => void;
}

export const OutreachActionConsole: React.FC<OutreachActionConsoleProps> = ({
  item,
  onSuccess,
}) => {
  const createMutation = useCreateOutreach();

  const [method, setMethod] = useState<ContactMethod>('WHATSAPP');
  const [status, setStatus] = useState<OutreachStatus>('RESPONDED');
  const [notes, setNotes] = useState('');
  const [response, setResponse] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    if (item) {
      setNotes(`Spoke with ${item.member.firstName}. `);
      setResponse('');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setFollowUpDate(defaultDate.toISOString().slice(0, 10));
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    try {
      await createMutation.mutateAsync({
        memberId: item.member.id,
        contactMethod: method,
        status,
        message: notes,
        response,
        nextFollowUpDate: followUpDate || undefined,
      });

      toast.success(`Outreach recorded for ${item.member.firstName}!`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record outreach');
    }
  };

  if (!item) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-xs border border-surface-container-low text-center text-secondary">
        <span className="material-symbols-outlined text-4xl text-secondary/50 mb-2">
          ring_volume
        </span>
        <p className="font-body-md text-body-md m-0">
          Select a member from the queue to start an outreach action.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-surface-container-low flex flex-col gap-4 sticky top-20">
      <div className="flex items-start justify-between border-b border-surface-container-low pb-3">
        <div>
          <span className="font-label-caps uppercase text-primary font-bold">
            Outreach Action Console
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase mt-0.5 m-0">
            {item.member.firstName} {item.member.lastName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-body-sm text-secondary text-xs">
              {formatPhone(item.member.phoneNumber)}
            </span>
            <a
              href={formatWhatsAppUrl(
                item.member.phoneNumber,
                'Hello from UI Judo Club! How are you doing?'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#166534] bg-[#DCFCE7] hover:bg-[#bbf7d0] px-2 py-0.5 rounded font-label-caps text-[10px] font-bold transition-colors"
            >
              Open WhatsApp ↗
            </a>
          </div>
        </div>
        <button
          onClick={() => {
            setNotes('');
            setResponse('');
          }}
          className="p-1 rounded text-secondary hover:bg-surface-container-low"
          title="Reset form"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <OutreachFormFields
          method={method}
          setMethod={setMethod}
          status={status}
          setStatus={setStatus}
          notes={notes}
          setNotes={setNotes}
          response={response}
          setResponse={setResponse}
          followUpDate={followUpDate}
          setFollowUpDate={setFollowUpDate}
        />

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full mt-2 bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-lg font-headline-sm uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {createMutation.isPending ? 'Logging...' : 'Record Outreach & Commit'}
        </button>
      </form>
    </div>
  );
};
