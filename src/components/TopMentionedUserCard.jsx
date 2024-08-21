import React, { useEffect, useState } from 'react';
import Card from './Card';

const TopMentionedUserCard = () => {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    fetch('/tweets/top-mentions')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched data:", data); // Debug: log the fetched data
        setTopUsers(data);
      })
      .catch(error => {
        console.error('Error fetching top mentions:', error);
      });
  }, []);

  return (
    <Card title="Top Mentioned Users">
      <div style={{ height: '400px', overflowY: 'auto', padding: '10px' }}>
        <ol style={{ paddingLeft: '20px', margin: 0 }}>
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <li key={index} style={{ marginBottom: '8px', fontSize: '16px' }}>
                {user.displayname || 'Unknown'} - {user.count} mentions
              </li>
            ))
          ) : (
            <p>No mentioned users found</p>
          )}
        </ol>
      </div>
    </Card>
  );
};

export default TopMentionedUserCard;
