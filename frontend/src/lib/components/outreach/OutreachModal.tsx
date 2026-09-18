import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { BeltBadge } from '../common/Badge';
import { OutreachFormFields } from './OutreachFormFields';
import { useCreateOutreach } from '../../hooks/useOutreach';
import { formatPhone, formatWhatsAppUrl } from '../../utils/formatters';
import type { ContactMethod, OutreachQueueItem, OutreachStatus } from '../../types';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OutreachQueueItem | null;
  onSuccess?: () => void;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  isOpen,
  onClose,
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

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        memberId: item.member.id,
        contactMethod: method,
        status,
        message: notes,
        response,
        nextFollowUpDate: followUpDate || undefined,
      });

      toast.success(`Outreach logged for ${item.member.firstName}!`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record outreach');
    }
  };

  const member = item.member;
  const whatsAppUrl = formatWhatsAppUrl(member.phoneNumber, `Hello ${member.firstName}, this is UI Judo Club checking in!`);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" title={`${member.firstName} ${member.lastName}`} description="Record Intervention & Member Follow-up">
      <div className="flex flex-col gap-4">
        {/* Judoka Profile & Fast Contact Strip */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-label-lg font-bold text-on-surface">{formatPhone(member.phoneNumber)}</span>
                <BeltBadge belt={member.beltRank} showKyu />
              </div>
              <span className="font-body-sm text-secondary text-xs">{member.facultyDepartment} • {item.daysInactive ?? 0} days inactive</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a href={`tel:${member.phoneNumber}`} className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface font-label-md text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>Call</span>
            </a>
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#166534] font-label-md text-xs font-bold flex items-center gap-1.5 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Strategy Context Banner */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15 text-xs text-on-surface">
          <AlertCircle className="w-4 h-4 text-primary shrink-0" />
          <span><strong className="font-semibold text-primary">Recommended Action:</strong> {item.recommendedAction}</span>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-1">
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

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container-low mt-1">
            <Button variant="outline" type="button" onClick={onClose} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Commit Outreach Record'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
