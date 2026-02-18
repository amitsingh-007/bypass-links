import { Header, type IRedirection, type IRedirections } from '@bypass/shared';
import { Button, Spinner } from '@bypass/ui';
import { Link01Icon, Download03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { syncRedirectionsToStorage } from '@background/redirections';
import { DEFAULT_RULE_ALIAS } from '../constants';
import { getValidRules, isMatchingRule } from '../utils';
import RedirectionRule from './RedirectionRule';
import { MAX_PANEL_SIZE } from '@/constants';
import { trpcApi } from '@/apis/trpcApi';
import { redirectionsItem } from '@/storage/items';

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
    const validRules = redirections.filter((x) => getValidRules(x));
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
    redirections.unshift({
      alias: DEFAULT_RULE_ALIAS,
      website: '',
      isDefault: false,
    });
    saveRedirectionTemp([...redirections]);
  };

  const handleRemoveRule = (pos: number) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    saveRedirectionTemp(newRedirections);
  };

  const handleSaveRule = (redirection: IRedirection, pos: number) => {
    redirections[pos] = redirection;
    saveRedirectionTemp([...redirections]);
  };

  const handleRuleMoveUp = (pos: number) => {
    if (pos === 0) {
      return;
    }
    const newRedirs = [...redirections];
    [newRedirs[pos], newRedirs[pos - 1]] = [newRedirs[pos - 1], newRedirs[pos]];
    saveRedirectionTemp(newRedirs);
  };

  const handleRuleMoveDown = (pos: number) => {
    if (pos >= redirections.length - 1) {
      return;
    }
    const newRedirs = [...redirections];
    [newRedirs[pos], newRedirs[pos + 1]] = [newRedirs[pos + 1], newRedirs[pos]];
    saveRedirectionTemp(newRedirs);
  };

  return (
    <div
      className="flex flex-col"
      style={{
        width: MAX_PANEL_SIZE.WIDTH,
        height: MAX_PANEL_SIZE.HEIGHT,
      }}
    >
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
      <div
        className="
          relative flex flex-1 flex-col gap-2 overflow-auto px-1 pt-2 pb-1
        "
      >
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
                handleRuleMoveUp={handleRuleMoveUp}
                handleRuleMoveDown={handleRuleMoveDown}
              />
            </div>
          );
        })}
        {isFetching && (
          <div
            className="
              absolute inset-0 z-50 flex items-center justify-center bg-black/50
            "
          >
            <Spinner className="size-8" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ShortcutsPanel;
