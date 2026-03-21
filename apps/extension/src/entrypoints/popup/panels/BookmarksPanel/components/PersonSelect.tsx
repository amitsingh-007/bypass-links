import {
  sortByRecency,
  sortAlphabetically,
  useBookmark,
  usePerson,
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
  useComboboxAnchor,
} from '@bypass/ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserWarning03Icon } from '@hugeicons/core-free-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface IOptionData {
  label: string;
  value: string;
  image: string;
}

interface PersonSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

function PersonSelect({ value, onChange }: PersonSelectProps) {
  const { getDefaultOrRootFolderUrls } = useBookmark();
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();
  const [personList, setPersonList] = useState<IOptionData[]>([]);
  const [orderByRecency, setOrderByRecency] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const anchorRef = useComboboxAnchor();

  const initPersonList = useCallback(async () => {
    const decodedPersons = await getAllDecodedPersons();
    const urls = await getDefaultOrRootFolderUrls();
    const personsWithImageUrl = await getPersonsWithImageUrl(decodedPersons);
    const personList = orderByRecency
      ? sortByRecency(personsWithImageUrl, urls)
      : sortAlphabetically(personsWithImageUrl);
    const list = personList.map<IOptionData>(({ imageUrl, name, uid }) => ({
      label: name,
      value: uid,
      image: imageUrl,
    }));
    setPersonList(list);
  }, [
    orderByRecency,
    getDefaultOrRootFolderUrls,
    getAllDecodedPersons,
    getPersonsWithImageUrl,
  ]);

  useEffect(() => {
    initPersonList();
  }, [initPersonList]);

  const toggleOrderByRecency = () => setOrderByRecency((prev) => !prev);

  const selectedPersons = useMemo(
    () => personList.filter((p) => value.includes(p.value)),
    [personList, value]
  );

  // Filter persons based on search query
  const filteredPersonList = useMemo(() => {
    if (!searchQuery.trim()) return personList;
    return personList.filter((person) =>
      person.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [personList, searchQuery]);

  const hasResults = filteredPersonList.length > 0;

  const renderAvatarWithPreview = (
    person: IOptionData,
    triggerAvatarClassName: string
  ) => (
    <HoverCard key={`avatar-preview-${person.value}`}>
      <HoverCardTrigger delay={0} closeDelay={0}>
        <Avatar size="sm" className={triggerAvatarClassName}>
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
        <TooltipProvider>
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
        </TooltipProvider>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Tagged Persons</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by recency</span>
          <Switch
            checked={orderByRecency}
            size="sm"
            onCheckedChange={toggleOrderByRecency}
          />
        </div>
      </div>
      <div ref={anchorRef} className="w-full">
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
          <ComboboxContent anchor={anchorRef.current} className="p-0">
            <ComboboxList className="max-h-60 p-1 py-2">
              {filteredPersonList.map((person) => (
                <ComboboxItem key={person.value} value={person.value}>
                  <div className="flex items-center gap-2">
                    {renderAvatarWithPreview(person, 'size-6!')}
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
  );
}

export default PersonSelect;
