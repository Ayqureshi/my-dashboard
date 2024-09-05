import React, { useEffect, useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Card from './Card';
import LogoCard from './LogoCard';
import Chart from '../chartConfig';
import GaugeChart from 'react-gauge-chart';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import WordCloudCard from './WordCloudCard';
import TopMentionedUserCard from './TopMentionedUserCard';
import LanguageTreemap from './ LanguageTreemap';
import './Dashboard.css';

const DashboardContainer = styled('div')(({ theme, isSidebarOpen }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '20px',
  padding: '20px',
  paddingTop: '50px',
  transition: 'margin-left 0.3s',
  marginLeft: isSidebarOpen ? '240px' : '0',
  minHeight: '85vh',
  position: 'relative',
  width: '100%',
}));

const CardContainer = styled('div')({
  flex: '1 1 calc(33.333% - 20px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: '250px',
  '@media (max-width: 1200px)': {
    flex: '1 1 calc(50% - 20px)',
  },
  '@media (max-width: 768px)': {
    flex: '1 1 100%',
  },
  width: '100%',
  maxWidth: 'calc(100% - 40px)',
  boxSizing: 'border-box',
});

const LogoCardContainer = styled('div')(({ isSidebarOpen }) => ({
  position: 'fixed',
  top: '50px',
  left: isSidebarOpen ? '240px' : '0',
  zIndex: 1000,
  transition: 'left 0.3s',
}));

const MapContainer = styled('div')({
  width: '100%',
  height: '100%',
  backgroundColor: '#F0F0F0',
});

const geoUrl = "https://raw.githubusercontent.com/brechtv/looker_map_layers/master/world-countries-sans-antarctica.json";

const Dashboard = ({ isSidebarOpen, currentPage }) => {
  const [socialMediaLinkTweetsCount, setSocialMediaLinkTweetsCount] = useState(0);
  const [trumpTweetsCount, setTrumpTweetsCount] = useState(0);
  const [tweetsPerHourData, setTweetsPerHourData] = useState([]);
  const [trumpTweetsDaily, setTrumpTweetsDaily] = useState([]);
  const [top7Dates, setTop7Dates] = useState([]);
  const [sentimentScore, setSentimentScore] = useState(0);
  const tweetsPerMinuteChartRef = useRef(null);
  const tweetsProportionChartRef = useRef(null);
  const trumpTweetsChartRef = useRef(null);

  useEffect(() => {
    fetch('/tweets/donaldtrump/daily')
      .then(response => response.json())
      .then(data => {
        setTrumpTweetsDaily(data.dailyData);
        setTop7Dates(data.top7Dates);
        setTrumpTweetsCount(data.total);
      })
      .catch(error => console.error('Error fetching Trump tweets:', error));

    fetch('/tweets/socialmedialinks')
      .then(response => response.json())
      .then(data => setSocialMediaLinkTweetsCount(data.count))
      .catch(error => console.error('Error fetching social media link tweets:', error));

    fetch('/tweets/perhour')
      .then(response => response.json())
      .then(data => setTweetsPerHourData(data.hourlyData || []))
      .catch(error => console.error('Error fetching tweets per hour:', error));

    fetch('/tweets/proportion')
      .then(response => response.json())
      .then(data => {
        if (tweetsProportionChartRef.current) {
          tweetsProportionChartRef.current.destroy();
        }
        const tweetsProportionCtx = document.getElementById('tweetsProportionChart').getContext('2d');
        tweetsProportionChartRef.current = new Chart(tweetsProportionCtx, {
          type: 'doughnut',
          data: {
            labels: [
              `Tweet (${data.tweet}%)`, 
              `Quote (${data.quote}%)`, 
              `Replies (${data.replies}%)`, 
              `Retweets (${data.retweets}%)`
            ],
            datasets: [{
              label: 'Tweets Proportion',
              data: [parseFloat(data.tweet), parseFloat(data.quote), parseFloat(data.replies), parseFloat(data.retweets)],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  const label = data.labels[tooltipItem.index];
                  const value = data.datasets[0].data[tooltipItem.index];
                  return `${label}: ${value.toLocaleString()} tweets`;
                }
              }
            }
          }
        });
      })
      .catch(error => console.error('Error fetching tweet proportions:', error));
  }, []);

  useEffect(() => {
    const generateHourlyLabels = () => {
      const labels = [];
      for (let i = 0; i < 24; i++) {
        const hour = i % 12 === 0 ? 12 : i % 12;
        const period = i < 12 ? 'AM' : 'PM';
        labels.push(`${hour}:00 ${period}`);
      }
      return labels;
    };

    if (tweetsPerMinuteChartRef.current) {
      tweetsPerMinuteChartRef.current.destroy();
    }
    const tweetsPerMinuteCtx = document.getElementById('tweetsPerMinuteChart').getContext('2d');
    tweetsPerMinuteChartRef.current = new Chart(tweetsPerMinuteCtx, {
      type: 'line',
      data: {
        labels: generateHourlyLabels(),
        datasets: [{
          label: 'Tweets Per Hour',
          data: tweetsPerHourData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      }
    });
  }, [tweetsPerHourData]);

  useEffect(() => {
    if (trumpTweetsChartRef.current) {
      trumpTweetsChartRef.current.destroy();
    }
    const trumpTweetsCtx = document.getElementById('trumpTweetsChart').getContext('2d');
    trumpTweetsChartRef.current = new Chart(trumpTweetsCtx, {
      type: 'bar',
      data: {
        labels: trumpTweetsDaily.map(item => item._id),
        datasets: [{
          label: 'Tweets from @realDonaldTrump',
          data: trumpTweetsDaily.map(item => item.count),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }, [trumpTweetsDaily]);

  useEffect(() => {
    fetch('/tweets/sentiment')
      .then(response => response.json())
      .then(data => setSentimentScore(data.sentiment))
      .catch(error => console.error('Error fetching sentiment:', error));
  }, []);

  const cardContainers = document.querySelectorAll('.card-container');

  cardContainers.forEach(container => {
    const randomRow = Math.floor(Math.random() * 3) + 1;
    const randomCol = Math.floor(Math.random() * 3) + 1;

    container.style.gridRow = randomRow;
    container.style.gridColumn = randomCol;
  });

  return (
    <DashboardContainer isSidebarOpen={isSidebarOpen}>
      <LogoCardContainer isSidebarOpen={isSidebarOpen}>
        <LogoCard currentPage={currentPage} />
      </LogoCardContainer>
      <div className="card-container">
        <Card title="Tweets Per Hour" value="Hourly Data">
          <canvas id="tweetsPerMinuteChart"></canvas>
        </Card>
      </div>
      <div className="card-container">
        <Card title="Tweets Proportion">
          <canvas id="tweetsProportionChart"></canvas>
        </Card>
      </div>
      <div className="card-container">
        <Card title="Average Tweet Sentiment" value={`${(sentimentScore * 100).toFixed(2)}%`}>
          <GaugeChart
            id="sentiment-gauge-chart"
            nrOfLevels={3}
            percent={sentimentScore}
            colors={['#FF5F6D', '#FFC371', '#38E54D']}
          />
        </Card>
      </div>
      <div className="card-container">
        <Card title="Tweets from @realDonaldTrump" value={trumpTweetsCount}>
          <canvas id="trumpTweetsChart"></canvas>
          <div>
            <h4>Top 3 Dates with Most Tweets:</h4>
            <ul>
              {top7Dates.map((date, index) => (
                <li key={index}>{date._id}: {date.count} tweets</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
      <div className="card-container">
        <LanguageTreemap />
      </div>
      <div className="card-container">
        <Card title="Tweets with Social Media Links" value={socialMediaLinkTweetsCount}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              border: '20px solid #4CAF50', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {Math.round(socialMediaLinkTweetsCount / 1000)}K
            </div>
          </div>
        </Card>
      </div>
      <div className="card-container">
        <WordCloudCard />
      </div>
      <div className="card-container">
        <TopMentionedUserCard />
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;