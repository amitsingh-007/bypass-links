import {
  sortByRecency,
  sortAlphabetically,
  useBookmark,
  usePerson,
} from '@bypass/shared';
import {
  Avatar,
  Flex,
  Group,
  MultiSelect,
  type MultiSelectProps,
  Switch,
  Text,
} from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';

interface IOptionData {
  label: string;
  value: string;
  image: string;
}

const renderMultiSelectOption: MultiSelectProps['renderOption'] = ({
  option,
}) => (
  <Group gap="sm">
    <Avatar src={(option as IOptionData).image} radius="md" />
    <Text size="sm">{option.label}</Text>
  </Group>
);

function PersonSelect({ formProps }: { formProps: any }) {
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

  return (
    <MultiSelect
      searchable
      data-autofocus
      hidePickedOptions
      data={personList}
      label={
        <Flex align="center" gap={8}>
          Tagged Persons
          <Switch
            size="xs"
            color="yellow"
            checked={orderByRecency}
            onChange={toggleOrderByRecency}
          />
        </Flex>
      }
      placeholder="Persons"
      nothingFoundMessage="No person with this name"
      maxDropdownHeight={210}
      comboboxProps={{
        position: 'top',
        withinPortal: false,
        transitionProps: { transition: 'pop' },
      }}
      renderOption={renderMultiSelectOption}
      {...formProps}
    />
  );
}

export default PersonSelect;
