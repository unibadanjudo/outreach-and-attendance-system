import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { BeltRankSelector } from './BeltRankSelector';
import { useUpdateMember } from '../../hooks/useMembers';
import type { Member } from '../../types';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useUpdateMember();

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        otherNames: member.otherNames || '',
        nickname: member.nickname || '',
        phoneNumber: member.phoneNumber || '',
        facultyDepartment: member.facultyDepartment || '',
        matricNumber: member.matricNumber || '',
        dateOfBirth: member.dateOfBirth || '',
        judoStartDate: member.judoStartDate || '',
        motivation: member.motivation || '',
        howDidYouHearAboutUs: member.howDidYouHearAboutUs || '',
        beltRank: member.beltRank || 'Unranked',
      });
      setErrorMsg(null);
    }
  }, [member, isOpen]);

  if (!member) return null;

  const handleChange = (field: keyof Member, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      setErrorMsg('First name and last name are required.');
      return;
    }

    try {
      await mutation.mutateAsync({
        id: member.id,
        data: formData,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update member in Google Sheets. Please retry.',
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Member Information"
      description="Update identity, contact details, academics, and belt rank in Google Sheets."
      maxWidth="xl"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Identity Section */}
        <div className="flex flex-col gap-3">
          <span className="font-label-caps text-xs text-primary font-bold tracking-wider">
            1. JUDOKA IDENTITY
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name *"
              value={formData.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="e.g. Adewale"
              required
            />
            <Input
              label="Last Name *"
              value={formData.lastName || ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="e.g. Oladipo"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Other Names"
              value={formData.otherNames || ''}
              onChange={(e) => handleChange('otherNames', e.target.value)}
              placeholder="Middle or native names"
            />
            <Input
              label="Dojo Nickname"
              value={formData.nickname || ''}
              onChange={(e) => handleChange('nickname', e.target.value)}
              placeholder="e.g. Tiger, Cap, Sensei"
            />
          </div>
        </div>

        {/* Contact & Academics Section */}
        <div className="flex flex-col gap-3 pt-2 border-t border-surface-container-low">
          <span className="font-label-caps text-xs text-primary font-bold tracking-wider">
            2. CONTACT & ACADEMIC INFO
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone / WhatsApp Number"
              value={formData.phoneNumber || ''}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="e.g. 08012345678"
            />
            <Input
              label="Matric / Student ID"
              value={formData.matricNumber || ''}
              onChange={(e) => handleChange('matricNumber', e.target.value)}
              placeholder="e.g. 219482"
            />
          </div>
          <Input
            label="Faculty / Department"
            value={formData.facultyDepartment || ''}
            onChange={(e) => handleChange('facultyDepartment', e.target.value)}
            placeholder="e.g. Faculty of Education - Human Kinetics"
          />
        </div>

        {/* Dojo Profile & Belt Rank Section */}
        <div className="flex flex-col gap-3 pt-2 border-t border-surface-container-low">
          <span className="font-label-caps text-xs text-primary font-bold tracking-wider">
            3. JUDO PROFILE & BELT RANK
          </span>

          <BeltRankSelector
            value={formData.beltRank}
            onChange={(formatted) => handleChange('beltRank', formatted)}
            showPreview
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date Started Judo"
              type="date"
              value={formData.judoStartDate || ''}
              onChange={(e) => handleChange('judoStartDate', e.target.value)}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            />
          </div>

          <Input
            label="Primary Motivation"
            value={formData.motivation || ''}
            onChange={(e) => handleChange('motivation', e.target.value)}
            placeholder="e.g. Sport, Self Defense, Fitness, Competition"
          />

          <Input
            label="How Did You Hear About Us"
            value={formData.howDidYouHearAboutUs || ''}
            onChange={(e) => handleChange('howDidYouHearAboutUs', e.target.value)}
            placeholder="e.g. Social media, friend, online group, flyer"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-error-container/20 border border-error-container text-on-error-container rounded-xl font-body-sm text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-error">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container-low">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
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
                <span className="material-symbols-outlined text-sm">save</span>
                <span>Update Judoka Info</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
