import { Toolbar, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Search from '@bypass/shared/components/Search';

const Header = ({
  title,
  onSearchChange,
}: {
  title: string;
  onSearchChange: (searchText: string) => void;
}) => {
  return (
    <AppBar position="static" sx={{ borderRadius: '4px' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Search onChange={onSearchChange} />
        <Typography
          variant="h6"
          sx={{
            textTransform: 'uppercase',
            userSelect: 'none',
            fontWeight: '600',
            color: 'azure',
          }}
        >
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
