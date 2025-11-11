import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Загрузка...',
  fullScreen = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: 3,
        height: fullScreen ? '100vh' : 'auto',
        minHeight: fullScreen ? '100vh' : '200px',
      }}
    >
      <CircularProgress />
      <Typography variant="body1" color="textSecondary">
        {message}
      </Typography>
    </Box>
  );
};