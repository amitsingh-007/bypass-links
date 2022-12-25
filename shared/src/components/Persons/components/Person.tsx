import { ActionIcon, Badge, Card, Image, Text } from '@mantine/core';
import { memo, useContext, useEffect, useState } from 'react';
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
    <Card<any>
      component={ActionIcon}
      radius="lg"
      withBorder
      sx={(theme) => ({
        height: '100%',
        width: '100%',
        backgroundColor: theme.colors.dark[9],
      })}
      onClick={openBookmarksList}
    >
      <Card.Section>
        <Image src={imageUrl} alt={name} height={110} />
        <Badge
          color="dark"
          variant="filled"
          radius="xl"
          sx={{ position: 'absolute', top: 0, right: '-3px' }}
        >
          {taggedUrlsCount}
        </Badge>
      </Card.Section>
      <Text
        weight={700}
        size="sm"
        lineClamp={2}
        ta="center"
        lh={1.15}
        title={name}
      >
        {name}
      </Text>
    </Card>
  );
});

export default Person;
