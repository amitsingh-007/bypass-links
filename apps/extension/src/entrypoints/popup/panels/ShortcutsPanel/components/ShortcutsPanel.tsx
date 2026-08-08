import {
  Header,
  type IRedirection,
  type IRedirections,
  swrKeys,
} from '@bypass/shared';
import { Button, Spinner } from '@bypass/ui';
import { Link01Icon, Download03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { trpcApi } from '@/apis/trpcApi';
import { redirectionsItem } from '@/storage/items';
import { syncRedirectionsToStorage } from '@background/redirections';
import Panel from '@popup/components/Panel';
import { useLastVisitedMap } from '@popup/hooks/useLastVisited';

import { DEFAULT_RULE_ALIAS } from '../constants';
import { getValidRules, isMatchingRule } from '../utils';
import RedirectionRule from './RedirectionRule';

const SAVE_ERROR = 'Could not save shortcuts';

const fetchRedirections = async () => {
  const stored = await redirectionsItem.getValue();
  return stored.map(
    ({ alias, website, isDefault }) =>
      ({
        alias: atob(alias),
        website: atob(website),
        isDefault,
      }) satisfies IRedirection
  );
};

function ShortcutsPanel() {
  const [searchText, setSearchText] = useState('');
  // null means "no local edits yet", distinct from "edited to an empty list"
  const [stagedRedirections, setStagedRedirections] =
    useState<IRedirections | null>(null);

  const { data: storedRedirections, isLoading } = useSWR(
    swrKeys.redirections,
    fetchRedirections
  );
  const redirections = stagedRedirections ?? storedRedirections ?? [];
  const lastVisitedMap = useLastVisitedMap(redirections.map((r) => r.website));

  const { trigger: saveRedirections, isMutating } = useSWRMutation(
    swrKeys.redirections,
    async (_key, { arg: rules }: { arg: IRedirections }) => {
      const validRules = rules.filter(getValidRules);
      const isSaveSuccess =
        await trpcApi.firebaseData.redirectionsPost.mutate(validRules);
      // Thrown, not returned early, so a false response and a rejection look the same
      if (!isSaveSuccess) {
        throw new Error(SAVE_ERROR);
      }
      await syncRedirectionsToStorage();
      setStagedRedirections(null);
      toast.success('Saved successfully');
    },
    { onError: () => toast.error(SAVE_ERROR) }
  );

  const isFetching = isLoading || isMutating;
  const isSaveActive = stagedRedirections !== null;

  const stageEdit = (edit: (rules: IRedirections) => IRedirections) =>
    setStagedRedirections(edit(redirections));

  const handleSave = () => saveRedirections(redirections);

  const handleAddRule = () =>
    stageEdit((rules) => [
      { alias: DEFAULT_RULE_ALIAS, website: '', isDefault: false },
      ...rules,
    ]);

  const handleRemoveRule = (pos: number) =>
    stageEdit((rules) => rules.toSpliced(pos, 1));

  const handleSaveRule = (redirection: IRedirection, pos: number) =>
    stageEdit((rules) => rules.with(pos, redirection));

  const handleRuleMove = (pos: number, offset: number) => {
    const target = pos + offset;
    if (target < 0 || target >= redirections.length) {
      return;
    }
    stageEdit((rules) =>
      rules.with(pos, rules[target]).with(target, rules[pos])
    );
  };

  return (
    <Panel>
      <Header onSearchChange={setSearchText}>
        <Button
          disabled={isFetching}
          variant="secondary"
          onClick={handleAddRule}
        >
          <HugeiconsIcon icon={Link01Icon} />
          Add
        </Button>
        <Button disabled={!isSaveActive || isFetching} onClick={handleSave}>
          {isFetching && <Spinner className="mr-2 size-4" />}
          <HugeiconsIcon icon={Download03Icon} />
          Save
        </Button>
      </Header>
      <div className="relative flex flex-1 flex-col gap-2 overflow-auto px-1 pt-2 pb-1">
        {redirections.map((redirection, index) => {
          const isMatch = isMatchingRule(redirection, searchText);
          return (
            <div
              key={`${redirection.alias}_${redirection.website}`}
              tabIndex={0}
              data-testid={`rule-${index}`}
              data-search-active={searchText.length > 0}
              data-match={isMatch}
              className="data-[search-active=true]:data-[match=false]:hidden"
            >
              <RedirectionRule
                {...redirection}
                pos={index}
                total={redirections.length}
                lastVisited={lastVisitedMap[redirection.website]}
                handleRemoveRule={handleRemoveRule}
                handleSaveRule={handleSaveRule}
                handleRuleMove={handleRuleMove}
              />
            </div>
          );
        })}
        {isFetching && (
          <div
            data-testid="loading-overlay"
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <Spinner className="size-8" />
          </div>
        )}
      </div>
    </Panel>
  );
}

export default ShortcutsPanel;
