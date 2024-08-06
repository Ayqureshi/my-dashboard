import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
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
});

const LeftSection = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const Logo = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  marginLeft: theme.spacing(8),
  textDecoration: 'none',
  fontSize: '24px',
  fontWeight: 'normal',
  fontFamily: 'Rhodium Libre, serif',
}));

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#fff',
  marginLeft: theme.spacing(5),
  flexGrow: 1,
  maxWidth: '600px',
  border: '1px solid black', // Set the border color to black
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#757575',
  cursor: 'pointer', // Set cursor to pointer to indicate clickability
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 'normal',
  fontFamily: 'Rhodium Libre, serif',
  width: '100%', // Ensure it takes full width of the parent
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    border: 'none', // Remove any default border from input
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
});

const NavLink = styled(Button)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 'normal',
  fontFamily: 'Rhodium Libre, serif',
  color: '#000',
  textTransform: 'none',
  textDecoration: 'none',
}));

export default function Navbar({ toggleSidebar }) {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  // Use useCallback to memoize the debounced function
  const debouncedFetchSuggestions = useCallback(
    debounce(async (value) => {
      if (value) {
        try {
          const response = await fetch(`/tweets/search?q=${encodeURIComponent(value)}`);
          const data = await response.json();
          setSuggestions(data.slice(0, 3)); // Limit to 3 suggestions
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    }, 300), // 300ms debounce delay
    [] // No dependencies to pass, use an empty array
  );

  // Effect to call the debounce function on value change
  useEffect(() => {
    debouncedFetchSuggestions(searchValue);
  }, [searchValue, debouncedFetchSuggestions]);

  // Handle input change
  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion.content); // Update to use content of the suggestion
    setSuggestions([]); // Clear suggestions after selection
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(searchValue)}`); // Use navigate instead of history.push
      setSuggestions([]); // Clear suggestions after search
    }
  };

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
            <MenuIcon className="navbar-text" />
          </IconButton>
          <Logo variant="h6" component={Link} to="/" className="navbar-text">
            Home
          </Logo>
        </LeftSection>
        <SearchContainer>
          <SearchIconWrapper onClick={handleSearchSubmit}>
            <SearchIcon className="navbar-text" />
          </SearchIconWrapper>
          <StyledInputBase
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()} // Listen for enter key
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            className="navbar-text"
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
          <NavLink component={Link} to="/about-us" className="navbar-text">
            About Us
          </NavLink>
          <NavLink component={Link} to="/support" className="navbar-text">
            Support
          </NavLink>
        </NavLinks>
      </StyledToolbar>
    </StyledAppBar>
  );
}
