import {
  sortByRecency,
  sortAlphabetically,
  useBookmark,
  usePerson,
} from '@bypass/shared';
import {
  Avatar,
  AvatarImage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@bypass/ui';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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

  const selectedPersons = useMemo(() => {
    const selected = new Set(value);
    return personList.filter((person) => selected.has(person.value));
  }, [personList, value]);

  const getSelectedLabel = (selectedValue: unknown): ReactNode => {
    const selectedItems = Array.isArray(selectedValue)
      ? (selectedValue as IOptionData[])
      : selectedValue
        ? [selectedValue as IOptionData]
        : [];

    if (selectedItems.length === 0) {
      return 'Select persons';
    }

    if (selectedItems.length > 2) {
      return `${selectedItems.length} persons selected`;
    }

    return (
      <div className="flex min-w-0 items-center gap-1.5">
        {selectedItems.map((person) => (
          <span
            key={person.value}
            className="flex min-w-0 items-center gap-1.5"
          >
            <Avatar size="sm" className="size-5! shrink-0">
              <AvatarImage src={person.image} alt={person.label} />
            </Avatar>
            <span className="truncate">{person.label}</span>
          </span>
        ))}
      </div>
    );
  };

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
      <div className="w-full">
        <Select
          multiple
          value={selectedPersons}
          isItemEqualToValue={(item, selectedItem) =>
            item.value === selectedItem.value
          }
          onValueChange={(newValue) => {
            if (!Array.isArray(newValue)) {
              onChange([]);
              return;
            }

            onChange(newValue.map((person) => person.value));
          }}
        >
          <SelectTrigger className="w-full" data-testid="person-select">
            <SelectValue>{getSelectedLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60 p-1">
            {personList.map((person) => (
              <SelectItem key={person.value} value={person}>
                <Avatar size="sm" className="size-5!">
                  <AvatarImage src={person.image} alt={person.label} />
                </Avatar>
                <span className="flex-1">{person.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default PersonSelect;
