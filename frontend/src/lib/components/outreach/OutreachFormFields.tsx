import React from 'react';
import { Phone, MessageSquare, Send, Users, Mail } from 'lucide-react';
import type { ContactMethod, OutreachStatus } from '../../types';

interface OutreachFormFieldsProps {
  method: ContactMethod;
  setMethod: (m: ContactMethod) => void;
  status: OutreachStatus;
  setStatus: (s: OutreachStatus) => void;
  notes: string;
  setNotes: (n: string) => void;
  response: string;
  setResponse: (r: string) => void;
  followUpDate: string;
  setFollowUpDate: (d: string) => void;
}

export const OutreachFormFields: React.FC<OutreachFormFieldsProps> = ({
  method,
  setMethod,
  status,
  setStatus,
  notes,
  setNotes,
  response,
  setResponse,
  followUpDate,
  setFollowUpDate,
}) => {
  const methods = [
    { id: 'PHONE_CALL', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
    { id: 'WHATSAPP', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'SMS', label: 'SMS', icon: <Send className="w-4 h-4" /> },
    { id: 'IN_PERSON', label: 'In Person', icon: <Users className="w-4 h-4" /> },
    { id: 'EMAIL', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  ];

  const setOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().slice(0, 10));
  };

  return (
    <>
      {/* Method */}
      <div className="flex flex-col gap-1">
        <label className="font-label-caps uppercase text-secondary font-bold text-[11px]">
          Contact Method
        </label>
        <div className="grid grid-cols-5 gap-1">
          {methods.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => setMethod(m.id as ContactMethod)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                method === m.id
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-transparent bg-surface-container-low text-secondary hover:bg-surface-container'
              }`}
            >
              {m.icon}
              <span className="font-label-caps text-[9px] mt-1">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Outcome Status */}
      <div className="flex flex-col gap-1">
        <label className="font-label-caps uppercase text-secondary font-bold text-[11px]">
          Outcome Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OutreachStatus)}
          className="bg-surface-container-low text-on-surface font-body-sm p-2 rounded-lg outline-none cursor-pointer"
        >
          <option value="WILL_RETURN">Will Return (Committed to next training)</option>
          <option value="RESPONDED">Responded (Conversation ongoing)</option>
          <option value="CONTACTED">Contacted (Awaiting reply)</option>
          <option value="NO_RESPONSE">No Response (Left voicemail / text unread)</option>
          <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable (Exams / Injury)</option>
          <option value="NOT_INTERESTED">Not Interested (Relocated / Quit)</option>
        </select>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <label className="font-label-caps uppercase text-secondary font-bold text-[11px]">
          Discussion Summary / Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-surface-container-low p-2 rounded-lg font-body-sm text-on-surface outline-none border border-transparent focus:border-primary"
          placeholder="Discussed reason for absence, condition, or plans..."
        />
      </div>

      {/* Response */}
      <div className="flex flex-col gap-1">
        <label className="font-label-caps uppercase text-secondary font-bold text-[11px]">
          Judoka Exact Response
        </label>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={2}
          className="w-full bg-surface-container-low p-2 rounded-lg font-body-sm text-on-surface outline-none border border-transparent focus:border-primary"
          placeholder="Direct quotation or statement..."
        />
      </div>

      {/* Follow-up Date */}
      <div className="flex flex-col gap-1">
        <label className="font-label-caps uppercase text-secondary font-bold text-[11px]">
          Schedule Follow-up Date
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="flex-1 bg-surface-container-low p-2 rounded-lg font-body-sm text-on-surface outline-none"
          />
          <button
            type="button"
            onClick={() => setOffset(3)}
            className="px-2 py-1.5 bg-surface-container-high hover:bg-surface-container text-on-surface font-label-caps text-xs rounded cursor-pointer"
          >
            +3d
          </button>
          <button
            type="button"
            onClick={() => setOffset(7)}
            className="px-2 py-1.5 bg-surface-container-high hover:bg-surface-container text-on-surface font-label-caps text-xs rounded cursor-pointer"
          >
            +7d
          </button>
        </div>
      </div>
    </>
  );
};
