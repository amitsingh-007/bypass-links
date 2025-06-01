import { ActionIcon, Avatar, Flex, Text } from '@mantine/core';
import { memo, useContext, useEffect, useState } from 'react';
import DynamicContext from '../../../provider/DynamicContext';
import usePerson from '../hooks/usePerson';
import { type IPerson } from '../interfaces/persons';
import { getPersonsPanelUrl } from '../utils/urls';
import styles from './styles/Person.module.css';

interface Props {
  person: IPerson;
}

const Person = memo<Props>(({ person }) => {
  const { location } = useContext(DynamicContext);
  const { uid, name } = person;
  const { resolvePersonImageFromUid } = usePerson();
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    resolvePersonImageFromUid(uid).then((url) => {
      setImageUrl(url);
    });
  }, [uid, person, resolvePersonImageFromUid]);

  const openBookmarksList = () => {
    location.push(getPersonsPanelUrl({ openBookmarksList: uid }));
  };

  return (
    <ActionIcon
      variant="outline"
      color="dark"
      radius="lg"
      w="100%"
      h="100%"
      classNames={{
        root: styles.container,
        icon: styles.iconInner,
      }}
      onClick={openBookmarksList}
    >
      <Avatar src={imageUrl} h={110} w="100%" alt={name} radius="xs" />
      <Flex align="center" w="100%" className={styles.image}>
        <Text
          fw={700}
          size="sm"
          lineClamp={2}
          px="4px"
          ta="center"
          lh={1.15}
          title={name}
          c="gray.4"
          className={styles.name}
        >
          {name}
        </Text>
      </Flex>
    </ActionIcon>
  );
});

export default Person;
