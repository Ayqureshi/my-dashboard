import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Styled components for search results
const SearchResultsContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const HighlightedText = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
}));

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        console.log("No query provided");
        return;
      }

      try {
        console.log(`Fetching results for query: ${query}`); // Debugging log
        const response = await fetch(`http://localhost:5001/tweets/search?q=${encodeURIComponent(query)}`); // Ensure the URL is correct

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data); // Debugging log to check fetched data

        if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
        }

        setResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchResults();
  }, [query]);

  // Function to highlight the search query in the result text
  const highlightQuery = (text) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <HighlightedText key={index}>{part}</HighlightedText>
      ) : (
        part
      )
    );
  };

  return (
    <SearchResultsContainer container direction="column" alignItems="center">
      <Typography variant="h4" gutterBottom>
        Search Results for "{query}"
      </Typography>
      <Grid item xs={12} md={8}>
        {results.length > 0 ? (
          results.map((result, index) => (
            <StyledPaper key={index} elevation={3}>
              <Typography variant="body1">
                {highlightQuery(result.content)}
              </Typography>
            </StyledPaper>
          ))
        ) : (
          <Typography variant="body1">No results found.</Typography>
        )}
      </Grid>
    </SearchResultsContainer>
  );
};

export default SearchResults;
