import React, { useEffect, useState } from 'react';
import WordCloud from 'react-d3-cloud';
import Card from './Card';

const WordCloudCard = () => {
  const [words, setWords] = useState([]);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetch('/tweets/hashtags')
      .then(response => response.json())
      .then(data => {
        const topWords = data
          .map(item => ({
            text: item.hashtag.replace(/[\[\]']+/g, ''), // Remove  and ' from text
            value: item.count,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 25);

        setWords(topWords);
      })
      .catch(error => console.error('Error fetching word cloud data:', error));
  }, []);

  // Increase the multiplier to make the font size larger
  const fontSizeMapper = word => Math.log2(word.value) * 1200; // Adjusted to 60 for larger font sizes
  const rotate = () => 0;

  const handleZoomIn = () => {
    setZoom(prevZoom => prevZoom * 1.2);
  };

  return (
    <Card title="Hashtag Word Cloud">
      <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        <div style={{ flex: 3, transform: `scale(${zoom})`, transformOrigin: 'center top', marginRight: '20px' }}>
          <WordCloud
            data={words}
            fontSizeMapper={fontSizeMapper}
            rotate={rotate}
            width={200}  // Adjusted width for better layout
            height={180} // Adjusted height for better layout
            font="serif"
            
          />
        </div>
        <div style={{ flex: 1, maxHeight: '500px', overflowY: 'auto', borderLeft: '1px solid #ddd', paddingLeft: '10px' }}>
          <h4>Top Hashtags</h4>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {words.map((word, index) => (
              <li key={index}>
                {index + 1}. {word.text} ({word.value} mentions)
              </li>
            ))}
          </ul>
          <button onClick={handleZoomIn} style={{ marginTop: '10px' }}>Zoom In</button>
        </div>
      </div>
    </Card>
  );
};

export default WordCloudCard;
