import { memo, useContext } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserWarning03Icon } from '@hugeicons/core-free-icons';
import {
  Avatar,
  AvatarGroup,
  AvatarImage,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@bypass/ui';
import DynamicContext from '../../../provider/DynamicContext';
import { type IPersonWithImage } from '../../Persons/interfaces/persons';
import { getPersonsPanelUrl } from '../../Persons/utils/urls';

const PersonAvatars = memo<{ persons: IPersonWithImage[] }>(({ persons }) => {
  const { location } = useContext(DynamicContext);

  if (persons.length === 0) {
    return (
      <Avatar size="sm" className="flex size-7 items-center justify-center">
        <HugeiconsIcon icon={UserWarning03Icon} className="size-4" />
      </Avatar>
    );
  }

  return (
    <AvatarGroup data-testid="avatar-group">
      {persons.map(({ imageUrl, uid, name }) => (
        <HoverCard key={uid}>
          <HoverCardTrigger delay={0} closeDelay={0}>
            <Avatar
              size="sm"
              className="ring-background size-7 cursor-pointer ring-1"
              data-testid={`avatar-${uid}`}
            >
              <AvatarImage src={imageUrl} alt={name} />
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent
            side="top"
            align="center"
            sideOffset={4}
            className="z-50 h-auto w-auto cursor-pointer rounded-full p-0.5"
            data-testid={`person-dropdown-${uid}`}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center justify-center">
                  <Avatar
                    className="size-20"
                    data-testid={`dropdown-avatar-${name}`}
                    onClick={() =>
                      location.push(
                        getPersonsPanelUrl({ openBookmarksList: uid })
                      )
                    }
                  >
                    <AvatarImage src={imageUrl} alt={name} />
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">{name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </HoverCardContent>
        </HoverCard>
      ))}
    </AvatarGroup>
  );
});

export default PersonAvatars;
