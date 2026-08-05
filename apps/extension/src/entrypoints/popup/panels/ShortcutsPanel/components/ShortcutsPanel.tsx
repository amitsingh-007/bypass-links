import { Header, type IRedirection, type IRedirections } from '@bypass/shared';
import { Button, Spinner } from '@bypass/ui';
import { Link01Icon, Download03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { trpcApi } from '@/apis/trpcApi';
import { redirectionsItem } from '@/storage/items';
import { syncRedirectionsToStorage } from '@background/redirections';
import Panel from '@popup/components/Panel';

import { DEFAULT_RULE_ALIAS } from '../constants';
import { getValidRules, isMatchingRule } from '../utils';
import RedirectionRule from './RedirectionRule';

function ShortcutsPanel() {
  const [redirections, setRedirections] = useState<IRedirections>([]);
  const [searchText, setSearchText] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [isSaveActive, setIsSaveActive] = useState(false);

  useEffect(() => {
    redirectionsItem.getValue().then((_redirections) => {
      const modifiedRedirections = _redirections.map(
        ({ alias, website, isDefault }) =>
          ({
            alias: atob(alias),
            website: atob(website),
            isDefault,
          }) satisfies IRedirection
      );
      setRedirections(modifiedRedirections);
      setIsFetching(false);
    });
  }, []);

  const saveRedirectionTemp = (newRedirections: IRedirections) => {
    setRedirections(newRedirections);
    setIsSaveActive(true);
  };

  const handleSave = async () => {
    setIsFetching(true);
    const validRules = redirections.filter(getValidRules);
    const isSaveSuccess =
      await trpcApi.firebaseData.redirectionsPost.mutate(validRules);
    if (isSaveSuccess) {
      syncRedirectionsToStorage();
      setRedirections(validRules);
      toast.success('Saved successfully');
    }
    setIsSaveActive(false);
    setIsFetching(false);
  };

  const handleAddRule = () => {
    const newRedirections = [
      {
        alias: DEFAULT_RULE_ALIAS,
        website: '',
        isDefault: false,
      },
      ...redirections,
    ];
    saveRedirectionTemp(newRedirections);
  };

  const handleRemoveRule = (pos: number) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    saveRedirectionTemp(newRedirections);
  };

  const handleSaveRule = (redirection: IRedirection, pos: number) => {
    const newRedirections = [...redirections];
    newRedirections[pos] = redirection;
    saveRedirectionTemp(newRedirections);
  };

  const handleRuleMove = (pos: number, offset: number) => {
    const target = pos + offset;
    if (target < 0 || target >= redirections.length) {
      return;
    }
    const newRedirs = [...redirections];
    [newRedirs[pos], newRedirs[target]] = [newRedirs[target], newRedirs[pos]];
    saveRedirectionTemp(newRedirs);
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
        {redirections?.map((redirection, index) => {
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
