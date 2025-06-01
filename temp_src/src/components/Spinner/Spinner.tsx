import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export const Spinner = (): JSX.Element => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: 1, height: 1 }}>
      <CircularProgress size="12rem" sx={{ color: 'gray' }} />
    </Box>
  );
};
