import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useUiStore } from '../../stores/useUiStore';
import { useMembersList } from '../../hooks/useMembers';
import { BeltBadge } from '../common/Badge';

export const QuickSearchModal: React.FC = () => {
  const navigate = useNavigate();
  const { isSearchModalOpen, setSearchModalOpen } = useUiStore();
  const [query, setQuery] = useState('');

  const { data, isLoading } = useMembersList({
    search: query.trim().length >= 2 ? query.trim() : undefined,
    limit: 8,
  });

  const handleSelect = (memberId: string) => {
    setSearchModalOpen(false);
    setQuery('');
    navigate(`/members/${memberId}`);
  };

  return (
    <Modal
      isOpen={isSearchModalOpen}
      onClose={() => setSearchModalOpen(false)}
      title="Search Dojo Judokas"
      description="Quickly find judokas by name, phone, or matric number"
      maxWidth="lg"
    >
      <div className="flex flex-col gap-4">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-secondary absolute left-3 pointer-events-none" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type member name, matric number, or phone..."
            className="w-full bg-surface-container-low pl-10 pr-4 py-3 rounded-lg text-on-surface placeholder:text-secondary font-body-md text-body-md outline-none border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
          {isLoading && query.length >= 2 ? (
            <div className="py-6 text-center font-body-sm text-secondary">
              Searching registered judokas...
            </div>
          ) : data?.items && data.items.length > 0 ? (
            data.items.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container-low text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">
                    {m.firstName[0]}
                    {m.lastName[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="font-body-sm text-secondary text-xs">
                      {m.facultyDepartment} • {m.phoneNumber}
                    </span>
                  </div>
                </div>
                <BeltBadge belt={m.beltRank} showKyu />
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="py-6 text-center font-body-sm text-secondary">
              No matching judokas found for "{query}".
            </div>
          ) : (
            <div className="py-4 text-center font-body-sm text-secondary">
              Type at least 2 characters to search.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
