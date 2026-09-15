import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { BeltRankSelector } from './BeltRankSelector';
import { useUpdateMemberBeltRank } from '../../hooks/useMembers';
import { BeltBadge } from '../common/Badge';
import type { Member } from '../../types';

interface UpdateBeltRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const UpdateBeltRankModal: React.FC<UpdateBeltRankModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const [beltRank, setBeltRank] = useState<string>(member?.beltRank || 'Unranked');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useUpdateMemberBeltRank();

  // Keep state synced when member changes
  React.useEffect(() => {
    if (member) {
      setBeltRank(member.beltRank || 'Unranked');
      setErrorMsg(null);
    }
  }, [member, isOpen]);

  if (!member) return null;

  const handleSave = async () => {
    setErrorMsg(null);
    try {
      await mutation.mutateAsync({
        id: member.id,
        beltRank,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update belt rank in Google Sheets. Please retry.',
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Belt Rank"
      description="Record an official Judo grade promotion or update in the club register."
      maxWidth="md"
    >
      <div className="flex flex-col gap-5">
        {/* Judoka Preview Card */}
        <div className="flex items-center gap-3 bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
          <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {member.firstName[0]}
            {member.lastName[0]}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-lg text-on-surface font-bold truncate">
              {member.firstName} {member.lastName}
            </span>
            <div className="flex items-center gap-2 text-secondary font-body-sm text-xs">
              <span>{member.matricNumber || 'Matric N/A'}</span>
              <span>•</span>
              <span>Current:</span>
              <BeltBadge belt={member.beltRank} showKyu />
            </div>
          </div>
        </div>

        {/* Belt Rank Selector */}
        <BeltRankSelector value={beltRank} onChange={setBeltRank} showPreview />

        {errorMsg && (
          <div className="p-3 bg-error-container/20 border border-error-container text-on-error-container rounded-xl font-body-sm text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-error">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-low">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={mutation.isPending}
            className="flex items-center gap-1.5"
          >
            {mutation.isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">
                  progress_activity
                </span>
                <span>Saving to Google Sheets...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Commit Belt Rank</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
