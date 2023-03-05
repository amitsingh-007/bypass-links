import { sortAlphabetically, usePerson } from '@bypass/shared';
import { Avatar, Group, MultiSelect, Text } from '@mantine/core';
import { forwardRef, memo, useCallback, useEffect, useState } from 'react';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  value: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, ...others }: ItemProps, ref: any) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} radius="md" />
        <div>
          <Text>{label}</Text>
        </div>
      </Group>
    </div>
  )
);
SelectItem.displayName = 'SelectItem';

const PersonSelect = memo<{ formProps: any }>(function PersonSelect({
  formProps,
}) {
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();
  const [personList, setPersonList] = useState<ItemProps[]>([]);

  const initPersonList = useCallback(async () => {
    const decodedPersons = await getAllDecodedPersons();
    const personsWithImageUrl = await getPersonsWithImageUrl(decodedPersons);
    const list = sortAlphabetically(personsWithImageUrl).map<ItemProps>(
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
      label="Tagged Persons"
      placeholder="Persons"
      itemComponent={SelectItem}
      data={personList}
      searchable
      dropdownPosition="top"
      nothingFound="No person with this name"
      maxDropdownHeight="15.625rem"
      transitionProps={{
        duration: 150,
        transition: 'pop-top-left',
        timingFunction: 'ease',
      }}
      {...formProps}
    />
  );
});

export default PersonSelect;
