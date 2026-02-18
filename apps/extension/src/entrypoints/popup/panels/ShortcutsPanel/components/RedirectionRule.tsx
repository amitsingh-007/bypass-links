import { type IRedirection } from '@bypass/shared';
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@bypass/ui';
import useHistoryStore from '@store/history';
import { useEffect, useState } from 'react';
import {
  CalendarCheckOut02Icon,
  Delete02Icon,
  Download03Icon,
  Link01Icon,
  LinkForwardIcon,
  LinkSquare02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { getlastVisitedText } from '@popup/utils/lastVisited';
import { DEFAULT_RULE_ALIAS } from '../constants';
import { ReorderButton } from './ReorderButton';

type Props = IRedirection & {
  pos: number;
  total: number;
  handleRemoveRule: (pos: number) => void;
  handleSaveRule: (redirection: IRedirection, pos: number) => void;
  handleRuleMoveUp: (pos: number) => void;
  handleRuleMoveDown: (pos: number) => void;
};

function RedirectionRule({
  alias,
  website,
  isDefault,
  pos,
  total,
  handleRemoveRule,
  handleSaveRule,
  handleRuleMoveUp,
  handleRuleMoveDown,
}: Props) {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const [ruleAlias, setRuleAlias] = useState(alias);
  const [ruleWebsite, setRuleWebsite] = useState(website);
  const [isDefaultRule, setIsDefaultRule] = useState(isDefault);
  const [lastVisited, setLastVisited] = useState<string>();

  useEffect(() => {
    const initLastVisited = async () => {
      const lastVisitedText = await getlastVisitedText(website);
      setLastVisited(lastVisitedText);
    };
    initLastVisited();
  }, [website]);

  const handleRemoveClick = () => {
    handleRemoveRule(pos);
  };

  const handleSaveClick = () => {
    handleSaveRule(
      {
        alias: ruleAlias,
        website: ruleWebsite,
        isDefault: isDefaultRule,
      },
      pos
    );
  };

  const handleLinkOpen = () => {
    startHistoryMonitor();
    browser.tabs.create({ url: ruleWebsite, active: false });
  };

  const isSameRule =
    alias === ruleAlias &&
    website === ruleWebsite &&
    isDefault === isDefaultRule;
  const isRuleSaveActive = isSameRule || ruleAlias === DEFAULT_RULE_ALIAS;

  return (
    <div className="flex items-center justify-center">
      <ReorderButton
        pos={pos}
        total={total}
        handleRuleMoveUp={handleRuleMoveUp}
        handleRuleMoveDown={handleRuleMoveDown}
      />
      <div className="flex flex-1 gap-2">
        <InputGroup className="w-[25%]">
          <InputGroupAddon>
            <HugeiconsIcon icon={LinkForwardIcon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Enter Alias"
            value={ruleAlias}
            data-testid={`rule-${pos}-alias`}
            onChange={(e) => setRuleAlias(e.target.value.trim())}
          />
        </InputGroup>
        <InputGroup className="w-[72%]">
          <InputGroupAddon>
            <HugeiconsIcon icon={Link01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Enter Website"
            value={ruleWebsite}
            data-testid={`rule-${pos}-website`}
            onChange={(e) => setRuleWebsite(e.target.value.trim())}
          />
          {lastVisited && (
            <InputGroupAddon align="inline-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HugeiconsIcon
                      icon={CalendarCheckOut02Icon}
                      className="size-4.5 text-primary"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{lastVisited}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
      <div className="mx-2 flex items-center">
        <Switch
          checked={isDefaultRule}
          data-testid={`rule-${pos}-default`}
          onCheckedChange={setIsDefaultRule}
        />
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon-sm"
          disabled={!ruleWebsite}
          data-testid={`rule-${pos}-external-link`}
          onClick={handleLinkOpen}
        >
          <HugeiconsIcon icon={LinkSquare02Icon} />
        </Button>
        <Button
          size="icon-sm"
          disabled={isRuleSaveActive}
          data-testid={`rule-${pos}-save`}
          onClick={handleSaveClick}
        >
          <HugeiconsIcon icon={Download03Icon} />
        </Button>
        <Button
          variant="destructive"
          size="icon-sm"
          data-testid={`rule-${pos}-delete`}
          onClick={handleRemoveClick}
        >
          <HugeiconsIcon icon={Delete02Icon} />
        </Button>
      </div>
    </div>
  );
}

export default RedirectionRule;
