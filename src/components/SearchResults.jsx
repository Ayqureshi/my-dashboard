import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
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
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        console.log("No query provided");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/tweets/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
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

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedResults = results.sort((a, b) => {
    if (orderBy) {
      const compareA = orderBy === 'date' ? new Date(a[orderBy]) : a[orderBy];
      const compareB = orderBy === 'date' ? new Date(b[orderBy]) : b[orderBy];
      if (order === 'asc') {
        return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
      } else if (order === 'desc') {
        return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
      }
    }
    return 0;
  });

  return (
    <SearchResultsContainer container direction="column" alignItems="center">
      <Typography variant="h4" gutterBottom>
        Search Results for "{query}"
      </Typography>
      <Grid item xs={12} md={8}>
        {results.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tweet Text</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'asc'}
                      onClick={() => handleRequestSort('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'likeCount'}
                      direction={orderBy === 'likeCount' ? order : 'asc'}
                      onClick={() => handleRequestSort('likeCount')}
                    >
                      Likes
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'replyCount'}
                      direction={orderBy === 'replyCount' ? order : 'asc'}
                      onClick={() => handleRequestSort('replyCount')}
                    >
                      Replies
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'quoteCount'}
                      direction={orderBy === 'quoteCount' ? order : 'asc'}
                      onClick={() => handleRequestSort('quoteCount')}
                    >
                      Quotes
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{highlightQuery(result.content)}</TableCell>
                    <TableCell align="right">{result.date}</TableCell>
                    <TableCell align="right">{result.likeCount}</TableCell>
                    <TableCell align="right">{result.replyCount}</TableCell>
                    <TableCell align="right">{result.quoteCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1">No results found.</Typography>
        )}
      </Grid>
    </SearchResultsContainer>
  );
};

export default SearchResults;
