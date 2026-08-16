import {
  matchesText,
  useOrderedPersons,
  usePersonImageMap,
} from '@bypass/shared';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@bypass/ui';
import { UserWarning03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

interface IOptionData {
  label: string;
  value: string;
  image: string;
}

interface PersonSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

interface AvatarWithPreviewProps {
  person: IOptionData;
}

function AvatarWithPreview({ person }: AvatarWithPreviewProps) {
  return (
    <HoverCard>
      <HoverCardTrigger delay={0} closeDelay={0}>
        <Avatar
          size="sm"
          className="size-6!"
          data-testid={`person-avatar-${person.label}`}
        >
          <AvatarImage src={person.image} alt={person.label} />
          <AvatarFallback>
            <HugeiconsIcon icon={UserWarning03Icon} className="size-3" />
          </AvatarFallback>
        </Avatar>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        sideOffset={4}
        className="z-50 size-auto rounded-full p-0.5"
        data-testid={`person-avatar-preview-${person.value}`}
      >
        <Tooltip>
          <TooltipTrigger className="flex items-center justify-center">
            <Avatar className="size-20">
              <AvatarImage src={person.image} alt={person.label} />
              <AvatarFallback>
                <HugeiconsIcon icon={UserWarning03Icon} className="size-6" />
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right">{person.label}</TooltipContent>
        </Tooltip>
      </HoverCardContent>
    </HoverCard>
  );
}

function PersonSelect({ value, onChange }: PersonSelectProps) {
  const [orderByRecency, setOrderByRecency] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const { data: persons } = useOrderedPersons(orderByRecency);
  const imageUrls = usePersonImageMap(persons.map(({ uid }) => uid));

  const personList = persons.map<IOptionData>(({ name, uid }) => ({
    label: name,
    value: uid,
    image: imageUrls[uid] ?? '',
  }));

  const toggleOrderByRecency = () => setOrderByRecency((prev) => !prev);

  const selectedPersons = personList.filter((p) => value.includes(p.value));

  // Filtered only for the dropdown: the chips must keep showing selections
  const filteredPersonList = personList.filter((person) =>
    matchesText(searchQuery, person.label)
  );

  const hasResults = filteredPersonList.length > 0;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tagged Persons</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Sort by recency
            </span>
            <Switch
              checked={orderByRecency}
              size="sm"
              aria-label="Sort by recency"
              data-testid="recency-switch"
              onCheckedChange={toggleOrderByRecency}
            />
          </div>
        </div>
        <div ref={setAnchorEl} className="w-full">
          <Combobox
            multiple
            value={value}
            onValueChange={(newValue) => {
              if (Array.isArray(newValue)) {
                onChange(newValue);
                setSearchQuery('');
              }
            }}
          >
            <ComboboxChips className="w-full" data-testid="person-select">
              {selectedPersons.map((person) => (
                <ComboboxChip
                  key={person.value}
                  data-testid={`person-chip-${person.label}`}
                >
                  <div className="flex items-center gap-1">
                    <Avatar size="sm" className="size-5!">
                      <AvatarImage src={person.image} alt={person.label} />
                      <AvatarFallback>
                        <HugeiconsIcon
                          icon={UserWarning03Icon}
                          className="size-3"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{person.label}</span>
                  </div>
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder="Search persons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </ComboboxChips>
            <ComboboxContent anchor={anchorEl} className="p-0">
              <ComboboxList className="max-h-60 p-1 py-2">
                {filteredPersonList.map((person) => (
                  <ComboboxItem key={person.value} value={person.value}>
                    <div className="flex items-center gap-2">
                      <AvatarWithPreview person={person} />
                      <span className="flex-1">{person.label}</span>
                    </div>
                  </ComboboxItem>
                ))}
              </ComboboxList>
              {!hasResults && (
                <div className="py-2 text-center text-sm text-muted-foreground">
                  No persons found
                </div>
              )}
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default PersonSelect;
