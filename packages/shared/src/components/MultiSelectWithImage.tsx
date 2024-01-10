import {
  Avatar,
  AvatarProps,
  CheckIcon,
  Combobox,
  Flex,
  Group,
  MantineRadius,
  Pill,
  PillsInput,
  ScrollArea,
  StyleProp,
  __PopoverProps,
  useCombobox,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import styles from './styles/MultiSelectWithImage.module.css';

export interface IOptionData extends Record<string, any> {
  label: string;
  value: string;
  image: string;
}

interface OptionItemProps {
  data: IOptionData;
  radius?: MantineRadius;
  size?: AvatarProps['size'];
}

const OptionItem = ({ data, radius, size }: OptionItemProps) => {
  if (!data) {
    return null;
  }
  return (
    <>
      <Avatar src={data.image} radius={radius} size={size} />
      <span>{data.label}</span>
    </>
  );
};

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  options: IOptionData[];
  label: string;
  placeholder: string;
  nothingFound: string;
  maxDropdownHeight?: StyleProp<React.CSSProperties['maxHeight']>;
  comboboxProps?: __PopoverProps;
}

const MultiSelectWithImage = ({
  value = [],
  onChange,
  options,
  nothingFound,
  placeholder,
  label,
  maxDropdownHeight = 220,
  comboboxProps = {},
}: Props) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });
  const [search, setSearch] = useState('');

  const handleValueSelect = (newVal: string) => {
    const newValues = (() => {
      const isAlreadyExists = value.includes(newVal);
      // Remove if already selected
      if (isAlreadyExists) {
        return value.filter((x) => x !== newVal);
      }
      // Add if not already selected
      const valData = options.find((x) => x.value === newVal);
      return valData ? [...value, valData.value] : value;
    })();
    onChange(newValues);
  };

  const handleValueRemove = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const optionsMap = useMemo(() => {
    return options.reduce<Record<string, IOptionData>>((obj, item) => {
      obj[item.value] = item;
      return obj;
    }, {});
  }, [options]);

  const optionItems = value.map((item) => (
    <Pill
      key={item}
      withRemoveButton
      onRemove={() => handleValueRemove(item)}
      classNames={{ root: styles.pill }}
    >
      <Flex justify="center" align="center" gap="xs">
        <OptionItem data={optionsMap[item]} radius="xl" size="xs" />
      </Flex>
    </Pill>
  ));

  const renderedOptions = options
    .filter((item) =>
      item.label.toLowerCase().includes(search.trim().toLowerCase())
    )
    .map((item) => (
      <Combobox.Option
        key={item.value}
        value={item.value}
        active={value.includes(item.value)}
      >
        <Group gap="sm">
          <OptionItem data={item} radius="md" />
          {value.includes(item.value) ? <CheckIcon size={12} /> : null}
        </Group>
      </Combobox.Option>
    ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
      {...comboboxProps}
    >
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          rightSection={<Combobox.Chevron />}
          label={label}
        >
          <Pill.Group>
            {optionItems}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder={value.length ? '' : placeholder}
                onChange={(e) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(e.currentTarget.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && search.length === 0) {
                    e.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>
      <Combobox.Dropdown>
        {renderedOptions.length > 0 ? (
          <ScrollArea.Autosize
            type="scroll"
            mah={maxDropdownHeight}
            scrollbarSize={10}
            offsetScrollbars="y"
            className={styles.optionsDropdownScrollArea}
          >
            {renderedOptions}
          </ScrollArea.Autosize>
        ) : (
          <Combobox.Empty>{nothingFound}</Combobox.Empty>
        )}
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default MultiSelectWithImage;
