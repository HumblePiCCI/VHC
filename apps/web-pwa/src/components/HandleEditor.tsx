import React, { useEffect, useState } from 'react';
import { Button } from '@vh/ui';
import { getHandleError } from '../utils/handle';
import { useIdentity } from '../hooks/useIdentity';

export const HandleEditor: React.FC = () => {
  const { identity, updateHandle } = useIdentity();
  const [handleEdit, setHandleEdit] = useState('');
  const [handleEditError, setHandleEditError] = useState<string | null>(null);

  useEffect(() => {
    if (identity?.handle) {
      setHandleEdit(identity.handle);
    }
  }, [identity?.handle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = getHandleError(handleEdit);
    if (validation) {
      setHandleEditError(validation);
      return;
    }
    void updateHandle(handleEdit.trim()).catch((err) => setHandleEditError((err as Error).message));
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm dark:border-slate-700">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Handle</p>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        {identity?.handle ? `Current: @${identity.handle}` : 'No handle set'}
      </p>
      <form className="mt-2 flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
        <input
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
          value={handleEdit}
          onChange={(e) => {
            setHandleEdit(e.target.value);
            setHandleEditError(getHandleError(e.target.value));
          }}
          placeholder="Update handle"
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]{3,20}"
          data-testid="handle-edit-input"
        />
        <Button type="submit" variant="secondary" disabled={Boolean(getHandleError(handleEdit))}>
          Save handle
        </Button>
      </form>
      {handleEditError && <p className="text-xs text-red-600">{handleEditError}</p>}
    </div>
  );
};

