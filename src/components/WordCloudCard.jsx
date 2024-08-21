import React, { useEffect, useState } from 'react';
import WordCloud from 'react-d3-cloud';
import Card from './Card';

const WordCloudCard = () => {
  const [words, setWords] = useState([]);
  const [zoom, setZoom] = useState(1); // Initial zoom level

  useEffect(() => {
    fetch('/tweets/hashtags')
      .then(response => response.json())
      .then(data => {
        const topWords = data
          .map(item => ({
            text: item.hashtag,
            value: item.count,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 25);

        setWords(topWords);
      })
      .catch(error => console.error('Error fetching word cloud data:', error));
  }, []);

  const fontSizeMapper = word => Math.log2(word.value) * 35; // Fixed size for consistent layout
  const rotate = () => 0; // No rotation for better readability

  const handleZoomIn = () => {
    setZoom(prevZoom => prevZoom * 1.2); // Increase zoom by 20%
  };

  return (
    <Card title="Hashtag Word Cloud">
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '300px' }}>
        <div style={{ flex: 2, transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
          <WordCloud
            data={words}
            fontSizeMapper={fontSizeMapper}
            rotate={rotate}
            width={300} // Fixed width
            height={300} // Fixed height
          />
        </div>
        <div style={{ flex: 1, paddingLeft: '20px', overflowY: 'auto' }}>
          <h4>Top Hashtags</h4>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {words.map((word, index) => (
              <li key={index}>
                {index + 1}. {word.text} ({word.value} mentions)
              </li>
            ))}
          </ul>
          <button onClick={handleZoomIn} style={{ marginTop: '10px' }}>Zoom In</button> {/* Zoom In button */}
        </div>
      </div>
    </Card>
  );
};

export default WordCloudCard;
