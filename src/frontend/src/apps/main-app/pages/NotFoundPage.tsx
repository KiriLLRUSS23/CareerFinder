import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Error as ErrorIcon } from '@mui/icons-material';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <ErrorIcon sx={{ fontSize: 100, color: 'warning.main' }} />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h5" color="textSecondary" sx={{ mb: 2 }}>
          Страница не найдена
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          К сожалению, страница, которую вы ищете, не существует.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
        >
          На главную страницу
        </Button>
      </Box>
    </Container>
  );
};