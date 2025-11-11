import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  BarChart as AnalyticsIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Панель управления', icon: <DashboardIcon /> },
  { path: '/vacancies', label: 'Вакансии', icon: <WorkIcon /> },
  { path: '/resumes', label: 'Резюме', icon: <DescriptionIcon /> },
  { path: '/candidates', label: 'Кандидаты', icon: <PeopleIcon /> },
  { path: '/analytics', label: 'Аналитика', icon: <AnalyticsIcon /> },
  { path: '/settings', label: 'Настройки', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          paddingTop: '64px',
          backgroundColor: '#f9f9f9',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <React.Fragment key={item.path}>
              <ListItem
                button
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#e3f2fd',
                    borderRight: '4px solid #1976d2',
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
              {item.path === '/analytics' && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export { DRAWER_WIDTH };