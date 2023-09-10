import { ActionIcon, Badge, Flex, Image, Text } from '@mantine/core';
import { memo, useContext, useEffect, useState } from 'react';
import { TbUserOff } from 'react-icons/tb';
import DynamicContext from '../../../provider/DynamicContext';
import usePerson from '../hooks/usePerson';
import { IPerson } from '../interfaces/persons';
import { getPersonsPanelUrl } from '../utils/urls';

interface Props {
  person: IPerson;
}

const Person = memo<Props>(function Person({ person }) {
  const { location } = useContext(DynamicContext);
  const { uid, name, taggedUrls } = person;
  const { resolvePersonImageFromUid } = usePerson();
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    resolvePersonImageFromUid(uid).then((url) => {
      setImageUrl(url);
    });
  }, [uid, person, resolvePersonImageFromUid]);

  const taggedUrlsCount =
    taggedUrls && !!taggedUrls.length ? taggedUrls.length : 0;

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
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: theme.colors.dark[9],
      })}
      onClick={openBookmarksList}
    >
      <Image
        src={`${imageUrl}1`}
        alt={name}
        height="6.875rem"
        withPlaceholder
        placeholder={<TbUserOff size={30} />}
      />
      <Flex align="center" w="100%" sx={{ flex: 1 }} pos="relative">
        <Text
          weight={700}
          size="sm"
          lineClamp={2}
          px="4px"
          ta="center"
          lh={1.15}
          title={name}
          color="gray.4"
          sx={{ flex: 1 }}
        >
          {name}
        </Text>
        <Badge
          color="dark"
          variant="filled"
          radius="xl"
          pos="absolute"
          top="-25%"
          right="-0.1875rem"
        >
          {taggedUrlsCount}
        </Badge>
      </Flex>
    </ActionIcon>
  );
});

export default Person;
