import React from 'react';
import { Card as MuiCard, CardContent, Typography } from '@mui/material';

const Card = ({ title, value, children }) => {
  return (
    <MuiCard style={{ margin: '10px', padding: '20px' }}>
      <CardContent>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
        {children}
      </CardContent>
    </MuiCard>
  );
};

export default Card;
