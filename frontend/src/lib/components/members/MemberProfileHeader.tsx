import React, { useState } from 'react';
import { Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BeltBadge, ActivityStatusBadge } from '../common/Badge';
import { formatWhatsAppUrl, formatPhone } from '../../utils/formatters';
import { EditMemberModal } from './EditMemberModal';
import { UpdateBeltRankModal } from './UpdateBeltRankModal';
import type { MemberSummaryResponse } from '../../types';

interface MemberProfileHeaderProps {
  summary: MemberSummaryResponse;
  onContactClick?: () => void;
}

export const MemberProfileHeader: React.FC<MemberProfileHeaderProps> = ({
  summary,
  onContactClick,
}) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBeltModalOpen, setIsBeltModalOpen] = useState(false);

  const { member, activityStatus } = summary;
  const whatsappUrl = formatWhatsAppUrl(
    member.phoneNumber,
    `Hello Judoka ${member.firstName}, this is Dojo Command from UI Judo Club checking in.`
  );

  return (
    <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-surface-container-low shadow-xs flex flex-col gap-4">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/members')}
          className="inline-flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Judoka Directory</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary font-bold text-2xl shrink-0 shadow-xs">
            {member.firstName[0]}
            {member.lastName[0]}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight m-0">
                {member.firstName} {member.lastName}
              </h1>
              {member.nickname && (
                <span className="font-body-sm text-secondary italic">
                  "{member.nickname}"
                </span>
              )}
              <ActivityStatusBadge status={activityStatus} />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-secondary font-body-sm text-xs mt-1">
              <span>{member.facultyDepartment || 'Faculty of Education'}</span>
              <span>•</span>
              <span className="font-mono">{member.matricNumber || 'Matric N/A'}</span>
              <span>•</span>
              <span>{formatPhone(member.phoneNumber)}</span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <BeltBadge belt={member.beltRank} showKyu />
              <button
                onClick={() => setIsBeltModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-label-md text-primary hover:underline hover:text-primary-container cursor-pointer transition-colors"
                title="Quick update Judo belt rank"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Change Rank</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface px-3.5 py-2 rounded-xl font-label-md font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>Edit Profile</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-label-md font-bold transition-all shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`tel:${member.phoneNumber}`}
            className="inline-flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface px-3.5 py-2 rounded-xl font-label-md font-bold transition-all shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </a>

          {onContactClick && (
            <button
              onClick={onContactClick}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-3.5 py-2 rounded-xl font-label-md font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>Record Follow-up</span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile and Belt Modals */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={member}
      />
      <UpdateBeltRankModal
        isOpen={isBeltModalOpen}
        onClose={() => setIsBeltModalOpen(false)}
        member={member}
      />
    </div>
  );
};

