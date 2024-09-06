import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import PeopleIcon from '@mui/icons-material/People';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import TagIcon from '@mui/icons-material/Tag';
import MailIcon from '@mui/icons-material/Mail';
import StarIcon from '@mui/icons-material/Star';
import './Sidebar.css'; // Import the CSS file

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate(); // Hook for navigation

  // Define sidebar items with navigation paths
  const items = [
    { name: 'Hourly', icon: <VisibilityIcon />, path: '/zoomed-cards?filter=Hourly' },
    { name: 'Tweet Type', icon: <StarIcon />, path: '/zoomed-cards?filter=starred' },
    { name: 'Outside Links', icon: <LinkIcon />, path: '/zoomed-cards?filter=links' },
    { name: 'User Spotlight', icon: <PeopleIcon />, path: '/zoomed-cards?filter=people' },
    { name: 'Sentiment', icon: <SentimentSatisfiedIcon />, path: '/zoomed-cards?filter=sentiment' },
    { name: 'Hashtags', icon: <TagIcon />, path: '/zoomed-cards?filter=tags' },
    { name: 'Mentioned Users', icon: <MailIcon />, path: '/zoomed-cards?filter=mail' },
  ];

  // Handler for page change
  const handlePageChange = (path) => {
    navigate(path); // Navigate to the specified path
    toggleSidebar(); // Close the sidebar when navigating
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      onClose={toggleSidebar}
      className="sidebar"
    >
      <Button className="filters-button" onClick={toggleSidebar}>
        Filters
      </Button>
      <List>
        {items.map((item, index) => (
          <ListItem
            button
            key={index}
            onClick={() => handlePageChange(item.path)}
            className="sidebar-list-item"
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
