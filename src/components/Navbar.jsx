import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { debounce } from 'lodash';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: 'none',
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 20px',
});

const LeftSection = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const Logo = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  marginLeft: theme.spacing(2),
  textDecoration: 'none',
  fontSize: '1.5vw',
  fontWeight: 'normal',
  fontFamily: 'Rhodium Libre, serif',
  '@media (max-width: 768px)': {
    fontSize: '3vw',
  },
}));

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#fff',
  marginLeft: theme.spacing(5),
  flexGrow: 1,
  maxWidth: '600px',
  border: '1px solid black',
  '@media (max-width: 768px)': {
    maxWidth: '400px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#757575',
  cursor: 'pointer',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  fontSize: '1.2vw',
  fontWeight: 'normal',
  fontFamily: 'Rhodium Libre, serif',
  width: '100%',
  '@media (max-width: 768px)': {
    fontSize: '2.5vw',
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    border: 'none',
  },
}));

const SuggestionsBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  zIndex: 1,
  top: '100%',
  left: 0,
  right: 0,
  borderRadius: theme.shape.borderRadius,
}));

const NavLinks = styled('div')({
  display: 'flex',
  gap: '20px',
  marginLeft: 'auto',
  alignItems: 'center',
  whiteSpace: 'nowrap', // Prevent wrapping of the links
});

const NavLink = styled(Button)(({ theme }) => ({
  fontSize: '1.5vw',
  fontWeight: 'normal',
  fontFamily: 'Rhodium Libre, serif',
  color: '#000',
  textTransform: 'none',
  textDecoration: 'none',
  whiteSpace: 'nowrap', // Prevent text wrapping
  padding: '0 8px',
  minWidth: 'auto',
  '@media (max-width: 768px)': {
    fontSize: '3vw',
  },
}));

// Styling specifically for the About Us link to keep it in one line
const AboutNavLink = styled(NavLink)({
  maxWidth: '800px', // Set a smaller width to ensure it stays short
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis', // Add ellipsis if text overflows
});

export default function Navbar({ toggleSidebar }) {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  
  const debouncedFetchSuggestions = useRef(
    debounce(async (value) => {
      if (value) {
        try {
          const response = await fetch(`/tweets/search?q=${encodeURIComponent(value)}`);
          const data = await response.json();
          setSuggestions(data.slice(0, 3));
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedFetchSuggestions(searchValue);
  }, [searchValue, debouncedFetchSuggestions]);

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion.content);
    setSuggestions([]);
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(searchValue)}`);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchContainerRef]);

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <LeftSection>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            style={{ color: '#000' }}
          >
            <MenuIcon />
          </IconButton>
          <Logo variant="h6" component={Link} to="/">
            home
          </Logo>
        </LeftSection>
        <SearchContainer ref={searchContainerRef}>
          <SearchIconWrapper onClick={handleSearchSubmit}>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
          {suggestions.length > 0 && (
            <SuggestionsBox>
              <List>
                {suggestions.map((suggestion, index) => (
                  <ListItem button key={index} onClick={() => handleSuggestionClick(suggestion)}>
                    <ListItemText primary={suggestion.content} secondary={suggestion.user} />
                  </ListItem>
                ))}
              </List>
            </SuggestionsBox>
          )}
        </SearchContainer>
        <NavLinks>
          <AboutNavLink component={Link} to="https://election-integrity.online/">
            about us
          </AboutNavLink>
          <NavLink component={Link} to="/support">
            support
          </NavLink>
        </NavLinks>
      </StyledToolbar>
    </StyledAppBar>
  );
}
