import React from 'react';
import { Card as MuiCard, CardContent, Typography } from '@mui/material';

const LogoCard = ({ currentPage }) => (
  <MuiCard style={{ margin: '20px' }}>
    <CardContent>
      <Typography variant="h5" component="h2">
        {currentPage}
      </Typography>
    </CardContent>
  </MuiCard>
);

export default LogoCard;
