import React, { useState } from 'react';
import { useMembersList } from '../../lib/hooks/useMembers';
import { MemberFilters } from '../../lib/components/members/MemberFilters';
import { MemberTable } from '../../lib/components/members/MemberTable';
import { EditMemberModal } from '../../lib/components/members/EditMemberModal';
import { UpdateBeltRankModal } from '../../lib/components/members/UpdateBeltRankModal';
import { LoadingSkeleton } from '../../lib/components/common/LoadingSkeleton';
import { EmptyState } from '../../lib/components/common/EmptyState';
import { Button } from '../../lib/components/common/Button';
import type { Member } from '../../lib/types';

export const MembersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [faculty, setFaculty] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [rankingMember, setRankingMember] = useState<Member | null>(null);

  const { data, isLoading, isError, refetch } = useMembersList({
    page,
    limit: 25,
    search: search || undefined,
    faculty: faculty !== 'ALL' ? faculty : undefined,
    status: status !== 'ALL' ? status : undefined,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 25) || 1;

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFaculty = (val: string) => {
    setFaculty(val);
    setPage(1);
  };

  const handleStatus = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-low shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-caps bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded font-bold">
              DOJO DIRECTORY
            </span>
            <span className="font-body-sm text-secondary">
              Official University of Ibadan Roster
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight m-0">
            Judoka Members Roster
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="font-metric-lg text-primary leading-none">
              {data?.total ?? 0}
            </span>
            <span className="font-label-caps text-secondary text-[10px]">
              TOTAL ENROLLED
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <MemberFilters
        search={search}
        onSearchChange={handleSearch}
        faculty={faculty}
        onFacultyChange={handleFaculty}
        status={status}
        onStatusChange={handleStatus}
      />

      {/* Roster Table Content */}
      {isLoading ? (
        <LoadingSkeleton variant="table" count={8} />
      ) : isError ? (
        <EmptyState
          title="Could Not Load Judoka Directory"
          description="Error querying member records from Dojo backend."
          action={
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : !data?.items?.length ? (
        <EmptyState
          title="No Judokas Found"
          description="No club members matched your current filter criteria."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setFaculty('ALL');
                setStatus('ALL');
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <MemberTable
            members={data.items}
            onEditMember={setEditingMember}
            onEditBeltRank={setRankingMember}
          />

          {/* Pagination Strip */}
          <div className="flex items-center justify-between bg-surface-container-lowest px-4 py-3 rounded-xl border border-surface-container-low font-body-sm">
            <span className="text-secondary">
              Showing Page <strong className="text-on-surface">{page}</strong> of{' '}
              <strong className="text-on-surface">{totalPages}</strong> ({data.total} Judokas)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Info Modal */}
      <EditMemberModal
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        member={editingMember}
      />

      {/* Quick Belt Rank Modal */}
      <UpdateBeltRankModal
        isOpen={Boolean(rankingMember)}
        onClose={() => setRankingMember(null)}
        member={rankingMember}
      />
    </div>
  );
};
