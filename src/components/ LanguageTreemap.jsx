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

// List of language codes to ignore
const ignoredLanguages = ['QME', 'UND', 'QAM'];

// Function to generate random colors
const generateColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const LanguageTreemap = () => {
  const [languageData, setLanguageData] = useState([]);

  useEffect(() => {
    fetch('/tweets/languages')
      .then((response) => response.json())
      .then((data) => {
        // Filter out ignored languages, sort the data by count, and get the top 15 languages
        const top15Languages = data
          .filter(item => !ignoredLanguages.includes(item.language.toUpperCase())) // Filter out ignored languages
          .sort((a, b) => b.count - a.count)
          .slice(0, 15);

        // Formatting the data for Treemap with full names and colors
        const formattedData = top15Languages.map((item) => ({
          name: languageNames[item.language] || 'Unknown', // Display only the full name of the language
          size: item.count,
          fill: generateColor(), // Assign a random color to each language
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
          nameKey="name" // Display full names in the Treemap
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
    </Card>
  );
};

export default LanguageTreemap;
