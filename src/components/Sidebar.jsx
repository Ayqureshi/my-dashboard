import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import PeopleIcon from '@mui/icons-material/People';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import TagIcon from '@mui/icons-material/Tag';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MailIcon from '@mui/icons-material/Mail';
import StarIcon from '@mui/icons-material/Star';
import './Sidebar.css'; // Import the CSS file

const Sidebar = ({ isOpen, toggleSidebar, onPageChange }) => {
  const items = [
    { name: 'Dashboard', icon: <HomeIcon /> },
    { name: 'View', icon: <VisibilityIcon /> },
    { name: 'Starred', icon: <StarIcon /> },
    { name: 'Links', icon: <LinkIcon /> },
    { name: 'People', icon: <PeopleIcon /> },
    { name: 'Sentiment', icon: <SentimentSatisfiedIcon /> },
    { name: 'Tags', icon: <TagIcon /> },
    { name: 'Mail', icon: <MailIcon /> },
    { name: 'Location', icon: <LocationOnIcon /> },
  ];

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
            onClick={() => onPageChange(item.name)}
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
