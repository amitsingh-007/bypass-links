import { sortAlphabetically, usePerson } from '@bypass/shared';
import {
  Avatar,
  Group,
  MultiSelect,
  MultiSelectProps,
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

const PersonSelect = ({ formProps }: { formProps: any }) => {
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();
  const [personList, setPersonList] = useState<IOptionData[]>([]);

  const initPersonList = useCallback(async () => {
    const decodedPersons = await getAllDecodedPersons();
    const personsWithImageUrl = await getPersonsWithImageUrl(decodedPersons);
    const list = sortAlphabetically(personsWithImageUrl).map<IOptionData>(
      ({ imageUrl, name, uid }) => ({
        label: name,
        value: uid,
        image: imageUrl,
      })
    );
    setPersonList(list);
  }, [getAllDecodedPersons, getPersonsWithImageUrl]);

  useEffect(() => {
    initPersonList();
  }, [initPersonList]);

  return (
    <MultiSelect
      data={personList}
      label="Tagged Persons"
      placeholder="Persons"
      nothingFoundMessage="No person with this name"
      maxDropdownHeight={210}
      comboboxProps={{
        position: 'top',
        withinPortal: false,
        transitionProps: { transition: 'pop' },
      }}
      hidePickedOptions
      renderOption={renderMultiSelectOption}
      {...formProps}
    />
  );
};

export default PersonSelect;
