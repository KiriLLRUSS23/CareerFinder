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
  Rating,
} from '@mui/material';
import { Add as AddIcon, Download as DownloadIcon } from '@mui/icons-material';

interface Resume {
  id: string;
  name: string;
  position: string;
  experience: number;
  rating: number;
  skills: string[];
  location: string;
  status: 'available' | 'reviewing' | 'hired';
}

const mockResumes: Resume[] = [
  {
    id: '1',
    name: 'Иван Петров',
    position: 'Frontend Developer',
    experience: 5,
    rating: 5,
    skills: ['React', 'TypeScript', 'CSS', 'Node.js'],
    location: 'Казань',
    status: 'available',
  },
  {
    id: '2',
    name: 'Мария Сидорова',
    position: 'Backend Developer',
    experience: 7,
    rating: 4.5,
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    location: 'Москва',
    status: 'reviewing',
  },
  {
    id: '3',
    name: 'Алексей Иванов',
    position: 'DevOps Engineer',
    experience: 6,
    rating: 4,
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    location: 'Санкт-Петербург',
    status: 'available',
  },
];

export const ResumesPage: React.FC = () => {
  const [resumes] = useState<Resume[]>(mockResumes);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'reviewing':
        return 'warning';
      case 'hired':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Доступен';
      case 'reviewing':
        return 'На рассмотрении';
      case 'hired':
        return 'Нанят';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Резюме
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Загрузить резюме
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Поиск по имени или должности..."
          variant="outlined"
          size="small"
        />
      </Box>

      <Grid container spacing={2}>
        {resumes.map((resume) => (
          <Grid item xs={12} md={6} key={resume.id}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {resume.name}
                    </Typography>
                    <Typography color="textSecondary" variant="body2">
                      {resume.position} • {resume.location}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(resume.status)}
                    color={getStatusColor(resume.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Рейтинг
                  </Typography>
                  <Rating value={resume.rating} readOnly size="small" />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Опыт: {resume.experience} лет
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {resume.skills.map((skill) => (
                      <Chip key={skill} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button size="small" startIcon={<DownloadIcon />}>
                    Скачать
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};