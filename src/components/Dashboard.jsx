import React, { useEffect, useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Card from './Card';
import LogoCard from './LogoCard';
import Chart from '../chartConfig';
import GaugeChart from 'react-gauge-chart';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import WordCloudCard from './WordCloudCard';
import TopMentionedUserCard from './TopMentionedUserCard';
import './Dashboard.css'; // Import the CSS file

const DashboardContainer = styled('div')(({ theme, isSidebarOpen }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between', // Space between items
  gap: '20px',
  padding: '20px',
  paddingTop: '50px',
  transition: 'margin-left 0.3s',
  marginLeft: isSidebarOpen ? '240px' : '0',
  minHeight: '85vh', // Ensure container height
  position: 'relative',
  width: '100%',
}));

const CardContainer = styled('div')({
  flex: '1 1 calc(33.333% - 20px)', // 3 cards per row with gap on large screens
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: '250px', // Ensure cards don't shrink too much
  '@media (max-width: 1200px)': {
    flex: '1 1 calc(50% - 20px)', // 2 cards per row on medium screens
  },
  '@media (max-width: 768px)': {
    flex: '1 1 100%', // 1 card per row on small screens
  },
  width: '100%', // Make cards take full available width
  maxWidth: 'calc(100% - 40px)', // Adjust to fit within the container with padding
  boxSizing: 'border-box', // Ensure padding and width are calculated together
});

const LogoCardContainer = styled('div')(({ isSidebarOpen }) => ({
  position: 'fixed',
  top: '50px', // Adjust according to your navbar height
  left: isSidebarOpen ? '240px' : '0', // Adjust according to your sidebar width
  zIndex: 1000,
  transition: 'left 0.3s'
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

  const tweetsPerMinuteChartRef = useRef(null);
  const tweetsProportionChartRef = useRef(null);
  const trumpTweetsChartRef = useRef(null);

  useEffect(() => {
    // Fetch count of tweets from @realDonaldTrump
    fetch('/tweets/donaldtrump')
      .then(response => response.json())
      .then(data => setTrumpTweetsCount(data.count))
      .catch(error => console.error('Error fetching Trump tweets:', error));

    // Fetch count of tweets with social media links
    fetch('/tweets/socialmedialinks')
      .then(response => response.json())
      .then(data => setSocialMediaLinkTweetsCount(data.count))
      .catch(error => console.error('Error fetching social media link tweets:', error));

    // Fetch hourly tweet data
    fetch('/tweets/perhour')
      .then(response => response.json())
      .then(data => setTweetsPerHourData(data.hourlyData || []))
      .catch(error => console.error('Error fetching tweets per hour:', error));
  }, []);

  useEffect(() => {
    if (tweetsPerMinuteChartRef.current) {
      tweetsPerMinuteChartRef.current.destroy();
    }
    const tweetsPerMinuteCtx = document.getElementById('tweetsPerMinuteChart').getContext('2d');
    tweetsPerMinuteChartRef.current = new Chart(tweetsPerMinuteCtx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `Hour ${i}`),
        datasets: [{
          label: 'Tweets Per Hour',
          data: tweetsPerHourData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      }
    });
  
    if (trumpTweetsChartRef.current) {
      trumpTweetsChartRef.current.destroy();
    }
    const trumpTweetsCtx = document.getElementById('trumpTweetsChart').getContext('2d');
    trumpTweetsChartRef.current = new Chart(trumpTweetsCtx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `Hour ${i}`),
        datasets: [{
          label: 'Tweets from @realDonaldTrump',
          data: tweetsPerHourData,  // Change this to match actual data for Trump tweets
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      }
    });
  
    // Fetch tweet proportions
    fetch('/tweets/proportion')
      .then(response => response.json())
      .then(data => {
        const tweetPercentage = data.tweet;
        const quotePercentage = data.quote;
        const repliesPercentage = data.replies;
        const retweetsPercentage = data.retweets;

        console.log('Percentages:', { tweetPercentage, quotePercentage, repliesPercentage, retweetsPercentage }); // Log percentages

        if (tweetsProportionChartRef.current) {
          tweetsProportionChartRef.current.destroy();
        }
        const tweetsProportionCtx = document.getElementById('tweetsProportionChart').getContext('2d');
        tweetsProportionChartRef.current = new Chart(tweetsProportionCtx, {
          type: 'doughnut',
          data: {
            labels: [
              `Tweet (${tweetPercentage}%)`, 
              `Quote (${quotePercentage}%)`, 
              `Replies (${repliesPercentage}%)`, 
              `Retweets (${retweetsPercentage}%)`
            ],
            datasets: [{
              label: 'Tweets Proportion',
              data: [parseFloat(tweetPercentage), parseFloat(quotePercentage), parseFloat(repliesPercentage), parseFloat(retweetsPercentage)],
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
  
    return () => {
      if (tweetsPerMinuteChartRef.current) tweetsPerMinuteChartRef.current.destroy();
      if (tweetsProportionChartRef.current) tweetsProportionChartRef.current.destroy();
      if (trumpTweetsChartRef.current) trumpTweetsChartRef.current.destroy();
    };
  }, [tweetsPerHourData]);
  
  return (
    <DashboardContainer isSidebarOpen={isSidebarOpen}>
      <LogoCardContainer isSidebarOpen={isSidebarOpen}>
        <LogoCard currentPage={currentPage} />
      </LogoCardContainer>
      <CardContainer>
        <Card title="Tweets Per Hour" value="Hourly Data">
          <canvas id="tweetsPerMinuteChart"></canvas>
        </Card>
      </CardContainer>
      <CardContainer>
        <Card title="Tweets Proportion">
          <canvas id="tweetsProportionChart"></canvas>
        </Card>
      </CardContainer>
      <CardContainer>
        <Card title="Average User Sentiment" value="80%">
          <GaugeChart
            id="gauge-chart"
            nrOfLevels={3}
            percent={0.8}
            colors={['#FF5F6D', '#FFC371', '#38E54D']}
          />
        </Card>
      </CardContainer>
      <CardContainer>
        <Card title="Tweets from @realDonaldTrump" value={trumpTweetsCount}>
          <canvas id="trumpTweetsChart"></canvas>
        </Card>
      </CardContainer>
      <CardContainer>
        <Card title="Countries of Origin of Tweets">
          <MapContainer>
            <ComposableMap
              projection="geoEqualEarth"
              projectionConfig={{
                scale: 150,
                center: [0, 0]
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) => {
                  if (!geographies.length) {
                    console.error("No geographies loaded");
                    return null;
                  }
                  console.log("Geographies loaded:", geographies.length);
                  return geographies.map((geo) => {
                    const isHighlighted = ["United States of America", "China", "Russia"].includes(geo.properties.name);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isHighlighted ? "#F53" : "#D6D6DA"}
                        stroke="#FFFFFF"
                      />
                    );
                  });
                }}
              </Geographies>
            </ComposableMap>
          </MapContainer>
        </Card>
      </CardContainer>
      <CardContainer>
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
      </CardContainer>
      {/* New Cards */}
      <CardContainer>
        <WordCloudCard />
      </CardContainer>
      <CardContainer>
        <TopMentionedUserCard />
      </CardContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
