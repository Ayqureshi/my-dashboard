// LanguageTreemap.jsx
import React, { useEffect, useState } from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';

// Mapping of language codes to their expanded names (example list, expand as needed)
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

const LanguageTreemap = () => {
  const [languageData, setLanguageData] = useState([]);

  useEffect(() => {
    fetch('/tweets/languages')
      .then((response) => response.json())
      .then((data) => {
        // Sort the data by count and get the top 15 languages
        const top15Languages = data
          .sort((a, b) => b.count - a.count)
          .slice(0, 15);

        // Formatting the data for Treemap with initials and full names
        const formattedData = top15Languages.map((item) => ({
          name: languageNames[item.language] || 'Unknown', // Full name of the language
          initials: item.language.toUpperCase(), // Initials of the language
          size: item.count,
        }));

        setLanguageData(formattedData);
      })
      .catch((error) => console.error('Error fetching languages:', error));
  }, []);

  return (
    <Card title="Languages of Tweets">
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={languageData}
          dataKey="size"
          nameKey="initials" // Display initials in the Treemap
          stroke="#fff"
          fill="#8884d8"
          isAnimationActive
        >
          <Tooltip
            content={({ payload }) => {
              if (!payload || !payload.length) return null;
              const { name, size, initials } = payload[0].payload;
              return (
                <div
                  style={{
                    background: 'white',
                    border: '1px solid #ccc',
                    padding: '5px',
                  }}
                >
                  <strong>{initials}</strong>: {name}
                  <br />
                  Count: {size}
                </div>
              );
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </Card>
  );
};

export default LanguageTreemap;
