import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import WordCloud from 'react-d3-cloud';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import './ZoomedCardsPage.css';

// Define language names mapping
const languageNames = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  hi: 'Hindi',
  fr: 'French',
  in: 'Indonesian',
  nl: 'Dutch',
  tl: 'Tagalog',
  ht: 'Haitian Creole',
  it: 'Italian',
  no: 'Norwegian',
  de: 'German',
  et: 'Estonian',
  ja: 'Japanese',
  ca: 'Catalan',
  // Add more languages as needed
};

// Function to generate random colors
const generateColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const ZoomedCardsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filter = queryParams.get('filter');

  // State variables for different data sets
  const [hourlyData, setHourlyData] = useState([]);
  const [totalTweets, setTotalTweets] = useState(0);
  const [proportions, setProportions] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [linksCount, setLinksCount] = useState(0);
  const [trumpTweets, setTrumpTweets] = useState([]);
  const [countriesData, setCountriesData] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [zoom, setZoom] = useState(1); // Initial zoom level for word cloud
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data based on the selected filter
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error before fetching new data

      try {
        switch (filter) {
          case 'Hourly':
            const hourlyResponse = await axios.get('http://localhost:5001/tweets/perhour');
            setHourlyData(hourlyResponse.data.hourlyData);
            setTotalTweets(hourlyResponse.data.total);
            break;
          case 'starred':
            const proportionsResponse = await axios.get('http://localhost:5001/tweets/proportion');
            setProportions(proportionsResponse.data);
            break;
          case 'sentiment':
            const sentimentResponse = await axios.get('http://localhost:5001/tweets/sentiment');
            setSentiment(sentimentResponse.data.sentiment);
            break;
          case 'links':
            const linksResponse = await axios.get('http://localhost:5001/tweets/socialmedialinks');
            setLinksCount(linksResponse.data.count);
            break;
          case 'people':
            const trumpResponse = await axios.get('http://localhost:5001/tweets/donaldtrump/daily');
            setTrumpTweets(trumpResponse.data.dailyData);
            break;
          case 'location':
            const countriesResponse = await axios.get('http://localhost:5001/tweets/countries');
            setCountriesData(countriesResponse.data);
            break;
          case 'tags':
            const hashtagsResponse = await axios.get('http://localhost:5001/tweets/hashtags');
            const topWords = hashtagsResponse.data
              .map(item => ({
                text: item.hashtag.replace(/[[]']+/g, ''), // Remove unnecessary escape character
                value: item.count,
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 25);
            setHashtags(topWords);
            break;
          case 'mail':
            const languagesResponse = await axios.get('http://localhost:5001/tweets/languages');
            setCountriesData(languagesResponse.data); // Correct usage of setCountriesData
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  // Chart data and options preparation
  const tweetsPerHourData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Tweets Per Hour',
        data: hourlyData,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        fill: false,
      },
    ],
  };

  const tweetsPerHourOptions = {
    responsive: true,
    maintainAspectRatio: true, // Maintain aspect ratio to prevent infinite growth
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time of Day',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tweets',
        },
      },
    },
  };

  const tweetsProportionData = {
    labels: ['Original Tweets', 'Quotes', 'Replies', 'Retweets'],
    datasets: [
      {
        data: proportions
          ? [
              parseFloat(proportions.tweet),
              parseFloat(proportions.quote),
              parseFloat(proportions.replies),
              parseFloat(proportions.retweets),
            ]
          : [0, 0, 0, 0],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverOffset: 4,
      },
    ],
  };

  const tweetsProportionOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const sentimentData = {
    labels: ['Average Sentiment'],
    datasets: [
      {
        label: 'Sentiment Score',
        data: [sentiment !== null ? sentiment * 100 : 0], // Adjusted to display as percentage
        backgroundColor: ['#FFCE56'],
        borderWidth: 1,
      },
    ],
  };

  const sentimentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Set max value to 100 for percentage scale
        title: {
          display: true,
          text: 'Sentiment Score (%)',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += `${context.parsed.y.toFixed(1)}%`; // Display as percentage
            return label;
          },
        },
      },
    },
  };

  const trumpTweetsData = {
    labels: trumpTweets.map(tweet => tweet._id),
    datasets: [
      {
        label: 'Tweets by @realDonaldTrump',
        data: trumpTweets.map(tweet => tweet.count),
        backgroundColor: '#FF6384',
      },
    ],
  };

  const trumpTweetsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tweets',
        },
      },
    },
  };

  const countriesDataChart = {
    labels: countriesData.map(item => languageNames[item.language] || 'Unknown'),
    datasets: [
      {
        label: 'Languages of Tweets',
        data: countriesData.map(item => item.count),
        backgroundColor: countriesData.map(() => generateColor()),
      },
    ],
  };

  const countriesDataOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Language',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tweets',
        },
      },
    },
  };

  const fontSizeMapper = word => Math.log2(word.value) * 45; // Mapper function for word cloud font sizes
  const rotate = () => 0; // No rotation for better readability
  const handleZoomIn = () => setZoom(prevZoom => prevZoom * 1.2); // Increase zoom level for word cloud

  // Render zoomed-in content based on the selected filter
  const renderZoomedCard = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    switch (filter) {
      case 'Hourly':
        return (
          <div className="zoomed-card tweets-per-hour">
            <h2 className="zoomed-card-title">Tweets Per Hour</h2>
            <div className="zoomed-card-content">
              <p>Total Tweets: {totalTweets}</p>
              <div className="tweets-per-hour-visualization">
                <Line data={tweetsPerHourData} options={tweetsPerHourOptions} />
              </div>
            </div>
          </div>
        );
      case 'starred':
        return (
          <div className="zoomed-card tweets-proportions">
            <h2 className="zoomed-card-title">Tweets Proportions</h2>
            <div className="zoomed-card-content">
              <Doughnut data={tweetsProportionData} options={tweetsProportionOptions} />
            </div>
          </div>
        );
      case 'sentiment':
        return (
          <div className="zoomed-card tweet-sentiment">
            <h2 className="zoomed-card-title">Average Tweet Sentiment</h2>
            <div className="zoomed-card-content">
              <Bar data={sentimentData} options={sentimentOptions} />
            </div>
          </div>
        );
      case 'links':
        return (
          <div className="zoomed-card social-media-links">
            <h2 className="zoomed-card-title">Tweets with Social Media Links</h2>
            <div className="zoomed-card-content">
              <p>Total Tweets with Links: {linksCount}</p>
            </div>
          </div>
        );
      case 'people':
        return (
          <div className="zoomed-card trump-tweets">
            <h2 className="zoomed-card-title">Tweets from @realDonaldTrump</h2>
            <div className="zoomed-card-content">
              <Bar data={trumpTweetsData} options={trumpTweetsOptions} />
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="zoomed-card countries-of-origin">
            <h2 className="zoomed-card-title">Languages of Tweets</h2>
            <div className="zoomed-card-content">
              <Bar data={countriesDataChart} options={countriesDataOptions} />
            </div>
          </div>
        );
        case 'tags':
          return (
            <div className="zoomed-card hashtag-word-cloud">
              <h2 className="zoomed-card-title">Hashtag Word Cloud</h2>
              <div className="zoomed-card-content word-cloud-container">
                <div className="word-cloud" style={{ transform: `scale(${zoom})`, height: '300px' }}>
                  {hashtags.length > 0 ? (
                    <WordCloud
                      data={hashtags}
                      fontSizeMapper={fontSizeMapper}
                      rotate={rotate}
                      width={300}
                      height={300}
                    />
                  ) : (
                    <p>No data available for the word cloud.</p>
                  )}
                </div>
                <div className="hashtag-list-container">
                  <h4>Top Hashtags</h4>
                  <ul className="top-mentioned-list">
                    {hashtags.map((word, index) => (
                      <li key={index}>
                        {index + 1}. {word.text.replace(/[\[\]']/g, '')} ({word.value} mentions)
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleZoomIn} className="zoom-button">Zoom In</button>
                </div>
              </div>
            </div>
          );
      case 'mail':
        return (
          <div className="zoomed-card language-treemap">
            <h2 className="zoomed-card-title">Languages of Tweets</h2>
            <div className="zoomed-card-content">
              <ResponsiveContainer width="100%" height={300}>
                <Treemap
                  data={countriesData.map((item) => ({
                    name: languageNames[item.language] || 'Unknown',
                    size: item.count,
                    fill: generateColor(),
                  }))}
                  dataKey="size"
                  nameKey="name"
                  stroke="#fff"
                  isAnimationActive
                >
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const { name, size } = payload[0].payload;
                      return (
                        <div
                          style={{
                            background: 'white',
                            border: '1px solid #ccc',
                            padding: '5px',
                          }}
                        >
                          <strong>{name}</strong>
                          <br />
                          Count: {size}
                        </div>
                      );
                    }}
                  />
                </Treemap>
              </ResponsiveContainer>
            </div>
          </div>
        );
      default:
        return <p>Select a valid filter to view the zoomed card.</p>;
    }
  };

  return <div className="zoomed-cards-container">{renderZoomedCard()}</div>;
};

export default ZoomedCardsPage;
