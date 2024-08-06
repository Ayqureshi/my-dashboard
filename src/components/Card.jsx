import React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import MuiCard from '@mui/material/Card';

const CardValue = styled(Typography)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '16px',
}));

const StyledCard = styled(MuiCard)(({ theme }) => ({
  margin: '20px',
  padding: '20px',
  flexGrow: 1,
}));

const Card = ({ title, value, children }) => {
  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {value && <CardValue variant="h4">{value}</CardValue>}
        {children}
      </CardContent>
    </StyledCard>
  );
};

export default Card;
