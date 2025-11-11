import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const dashboardData = [
  { name: 'Янв', vacancies: 40, applications: 24, hired: 8 },
  { name: 'Фев', vacancies: 35, applications: 30, hired: 12 },
  { name: 'Мар', vacancies: 50, applications: 45, hired: 18 },
  { name: 'Апр', vacancies: 45, applications: 50, hired: 20 },
  { name: 'Май', vacancies: 60, applications: 55, hired: 25 },
  { name: 'Июн', vacancies: 55, applications: 60, hired: 30 },
];

const pieData = [
  { name: 'На рассмотрении', value: 35, color: '#2196F3' },
  { name: 'Отклонено', value: 15, color: '#F44336' },
  { name: 'Одобрено', value: 50, color: '#4CAF50' },
];

const stats = [
  { label: 'Всего вакансий', value: '45', icon: '📋' },
  { label: 'Активных кандидатов', value: '128', icon: '👥' },
  { label: 'Размещено резюме', value: '256', icon: '📄' },
  { label: 'Конверсия', value: '42%', icon: '📊' },
];

export const DashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        Панель управления
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="h4">{stat.icon}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Bar Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Статистика по месяцам
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vacancies" fill="#2196F3" name="Вакансии" />
                  <Bar dataKey="applications" fill="#FF9800" name="Заявки" />
                  <Bar dataKey="hired" fill="#4CAF50" name="Нанято" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Статус заявок
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Line Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Тренд активности
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="vacancies" stroke="#2196F3" strokeWidth={2} />
                  <Line type="monotone" dataKey="applications" stroke="#FF9800" strokeWidth={2} />
                  <Line type="monotone" dataKey="hired" stroke="#4CAF50" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};