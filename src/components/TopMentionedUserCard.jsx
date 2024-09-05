import React, { useEffect, useState } from 'react';
import Card from './Card';

const TopMentionedUserCard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopMentions = async () => {
      try {
        const response = await fetch('/tweets/top-mentions');
        if (!response.ok) {
          throw new Error('Failed to fetch top mentions. Please try again later.');
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        setTopUsers(data);
      } catch (error) {
        console.error('Error fetching top mentions:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMentions();
  }, []);

  if (loading) {
    return <Card title="Top Mentioned Users"><p>Loading...</p></Card>;
  }

  if (error) {
    return <Card title="Top Mentioned Users"><p>Error: {error}</p></Card>;
  }

  return (
    <Card title="Top Mentioned Users">
      <div style={{ height: '400px', overflowY: 'auto', padding: '10px' }}>
        {topUsers.length > 0 ? (
          <ol style={{ paddingLeft: '20px', margin: 0 }}>
            {topUsers.map((user, index) => (
              <li key={index} style={{ marginBottom: '8px', fontSize: '16px' }}>
                {user.displayname} - {user.count} mentions
              </li>
            ))}
          </ol>
        ) : (
          <p>No mentioned users found</p>
        )}
      </div>
    </Card>
  );
};

export default TopMentionedUserCard;