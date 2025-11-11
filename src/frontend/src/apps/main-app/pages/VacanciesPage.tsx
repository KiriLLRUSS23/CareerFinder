import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Vacancy {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  status: 'active' | 'closed' | 'draft';
  applicants: number;
}

const mockVacancies: Vacancy[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'Казань',
    salary: '150 000 - 200 000 ₽',
    status: 'active',
    applicants: 12,
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'Startup Inc',
    location: 'Москва',
    salary: '120 000 - 180 000 ₽',
    status: 'active',
    applicants: 8,
  },
  {
    id: '3',
    title: 'HR Manager',
    company: 'HR Solutions',
    location: 'Санкт-Петербург',
    salary: '80 000 - 120 000 ₽',
    status: 'closed',
    applicants: 25,
  },
];

export const VacanciesPage: React.FC = () => {
  const [vacancies] = useState<Vacancy[]>(mockVacancies);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);

  const handleAddVacancy = () => {
    setSelectedVacancy(null);
    setOpenDialog(true);
  };

  const handleEditVacancy = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVacancy(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'closed':
        return 'default';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'closed':
        return 'Закрыта';
      case 'draft':
        return 'Черновик';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Вакансии
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddVacancy}>
          Добавить вакансию
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Поиск по названию должности или компании..."
          variant="outlined"
          size="small"
        />
      </Box>

      <Grid container spacing={2}>
        {vacancies.map((vacancy) => (
          <Grid item xs={12} key={vacancy.id}>
            <Card sx={{ '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {vacancy.title}
                    </Typography>
                    <Typography color="textSecondary" variant="body2">
                      {vacancy.company} • {vacancy.location}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(vacancy.status)}
                    color={getStatusColor(vacancy.status) as any}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Зарплата
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {vacancy.salary}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Заявки
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {vacancy.applicants}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditVacancy(vacancy)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                  >
                    Удалить
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedVacancy ? 'Редактировать вакансию' : 'Создать вакансию'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Название должности"
            margin="normal"
            defaultValue={selectedVacancy?.title || ''}
          />
          <TextField
            fullWidth
            label="Компания"
            margin="normal"
            defaultValue={selectedVacancy?.company || ''}
          />
          <TextField
            fullWidth
            label="Локация"
            margin="normal"
            defaultValue={selectedVacancy?.location || ''}
          />
          <TextField
            fullWidth
            label="Зарплата"
            margin="normal"
            defaultValue={selectedVacancy?.salary || ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedVacancy ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};