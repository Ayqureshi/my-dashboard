import React from 'react';
import { List, ListItem, ListItemText, Divider } from '@mui/material';

const Sidebar = () => {
  const items = ['bub', 'view', 'tmp', 'links', 'porps', 'sent', 'tag', 'user', 'loc'];

  return (
    <div style={{ width: '200px', backgroundColor: '#f0f0f0', height: '100vh', padding: '10px' }}>
      <List>
        <ListItem>
          <ListItemText primary="Filters" />
        </ListItem>
        <Divider />
        {items.map((item) => (
          <ListItem button key={item}>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;
