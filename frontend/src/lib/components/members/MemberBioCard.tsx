import {
  GraduationCap,
  Calendar,
  Sparkles,
  Target,
  Megaphone,
  Hash,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { isReacher } from '../../types/auth.types';
import { formatDate, formatDateOfBirth } from '../../utils/date';
import type { Member } from '../../types';

interface MemberBioCardProps {
  member: Member;
}

export const MemberBioCard: React.FC<MemberBioCardProps> = ({ member }) => {
  const { user } = useAuthStore();
  const reacher = isReacher(user?.role);

  return (
    <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-surface-container-low shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-headline-sm text-base uppercase tracking-tight text-on-surface m-0 font-bold">
            Academic &amp; Dojo Profile
          </h2>
        </div>
        <span className="font-label-caps text-xs text-secondary bg-surface-container-low px-2.5 py-1 rounded-full">
          Judoka Background
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-body-sm">
        {/* Faculty & Department */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container-low">
          <div className="p-2 rounded-lg bg-surface-container text-primary shrink-0 mt-0.5">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-secondary font-semibold uppercase">
              Faculty / Department
            </span>
            <span className="font-medium text-on-surface mt-0.5 truncate" title={member.facultyDepartment}>
              {member.facultyDepartment || 'Not specified'}
            </span>
          </div>
        </div>

        {/* Matric / Student ID */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container-low">
          <div className="p-2 rounded-lg bg-surface-container text-primary shrink-0 mt-0.5">
            <Hash className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-secondary font-semibold uppercase">
              Matric / Student ID
            </span>
            <span className="font-mono font-medium text-on-surface mt-0.5">
              {member.matricNumber || 'Not provided'}
            </span>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container-low">
          <div className="p-2 rounded-lg bg-surface-container text-primary shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-label-caps text-[11px] text-secondary font-semibold uppercase">
                Date of Birth
              </span>
              {reacher && (
                <span className="text-[9px] font-label-caps text-secondary bg-surface-container px-1.5 py-0.2 rounded font-medium">
                  Month &amp; Day
                </span>
              )}
            </div>
            <span className="font-medium text-on-surface mt-0.5">
              {member.dateOfBirth
                ? formatDateOfBirth(member.dateOfBirth, reacher)
                : 'Not provided'}
            </span>
          </div>
        </div>

        {/* Date Joined / Started Judo */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container-low">
          <div className="p-2 rounded-lg bg-surface-container text-primary shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-secondary font-semibold uppercase">
              Date Started Judo
            </span>
            <span className="font-medium text-on-surface mt-0.5">
              {member.judoStartDate ? formatDate(member.judoStartDate) || member.judoStartDate : 'Not provided'}
            </span>
          </div>
        </div>

        {/* Primary Motivation */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container-low sm:col-span-2 lg:col-span-2">
          <div className="p-2 rounded-lg bg-surface-container text-primary shrink-0 mt-0.5">
            <Target className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-secondary font-semibold uppercase">
              Primary Motivation for Training Judo
            </span>
            <span className="font-medium text-on-surface mt-0.5">
              {member.motivation || 'Not specified'}
            </span>
          </div>
        </div>

        {/* How Did You Hear About Us */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container-low sm:col-span-2 lg:col-span-3">
          <div className="p-2 rounded-lg bg-surface-container text-primary shrink-0 mt-0.5">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-secondary font-semibold uppercase">
              How Did You Hear About Judo?
            </span>
            <span className="font-medium text-on-surface mt-0.5">
              {member.howDidYouHearAboutUs || 'Not specified'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
