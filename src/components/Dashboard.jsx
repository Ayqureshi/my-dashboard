import React from 'react';
import Card from './Card';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

const Dashboard = () => {
  // Sample data
  const data = {
    labels: ['Tweet', 'Quote', 'Replies', 'Retweets'],
    datasets: [
      {
        label: 'Tweets Proportion',
        data: [65, 8, 20, 7],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#AA64A4'],
      },
    ],
  };

  const lineData = {
    labels: ['01', '02', '03', '04', '05', '06'],
    datasets: [
      {
        label: 'Tweets from @realDonaldTrump',
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      <Card title="Tweets Per Minute" value="1,000,000">
        <Bar data={data} />
      </Card>
      <Card title="Tweets Proportion">
        <Doughnut data={data} />
      </Card>
      <Card title="Average User Sentiment" value="80%" />
      <Card title="Tweets from @realDonaldTrump" value="2,568">
        <Line data={lineData} />
      </Card>
      <Card title="Countries of Origin of Tweets">
        <img src="https://via.placeholder.com/300" alt="World Map" />
      </Card>
    </div>
  );
};

export default Dashboard;
