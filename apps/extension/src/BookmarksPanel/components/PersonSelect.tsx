import {
  IOptionData,
  MultiSelectWithImage,
  sortAlphabetically,
  usePerson,
} from '@bypass/shared';
import { memo, useCallback, useEffect, useState } from 'react';

const PersonSelect = memo<{ formProps: any }>(function PersonSelect({
  formProps,
}) {
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
    <MultiSelectWithImage
      options={personList}
      label="Tagged Persons"
      placeholder="Persons"
      nothingFound="No person with this name"
      maxDropdownHeight={210}
      comboboxProps={{ position: 'top' }}
      {...formProps}
    />
  );
});

export default PersonSelect;
