import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BeltBadge } from '../common/Badge';
import { formatPhone } from '../../utils/formatters';
import type { Member } from '../../types';

interface MemberTableProps {
  members: Member[];
  onEditMember?: (member: Member) => void;
  onEditBeltRank?: (member: Member) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  onEditMember,
  onEditBeltRank,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-low overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-secondary font-label-caps tracking-wider uppercase">
              <th className="py-3 px-4">Judoka</th>
              <th className="py-3 px-4">Belt Rank</th>
              <th className="py-3 px-4">Faculty / Dept</th>
              <th className="py-3 px-4">Matric / Phone</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body-sm">
            {members.map((member) => (
              <tr
                key={member.id}
                onClick={() => navigate(`/members/${member.id}`)}
                className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-on-surface group-hover:text-primary transition-colors">
                        {member.firstName} {member.lastName}
                      </span>
                      {member.nickname && (
                        <span className="font-body-sm text-secondary text-xs italic">
                          "{member.nickname}"
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <BeltBadge belt={member.beltRank} showKyu />
                    {onEditBeltRank && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBeltRank(member);
                        }}
                        className="p-1 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        title="Update Judo belt rank"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-on-surface font-medium">
                    {member.facultyDepartment || '—'}
                  </span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-on-surface font-semibold">
                      {member.matricNumber || '—'}
                    </span>
                    <span className="font-body-sm text-secondary text-xs">
                      {formatPhone(member.phoneNumber)}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {onEditMember && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMember(member);
                        }}
                        className="inline-flex items-center gap-1 text-secondary hover:text-on-surface font-label-md px-2 py-1 rounded hover:bg-surface-container transition-colors cursor-pointer"
                        title="Edit member information"
                      >
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        <span>Edit</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/members/${member.id}`);
                      }}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-md font-bold px-2 py-1 rounded hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
