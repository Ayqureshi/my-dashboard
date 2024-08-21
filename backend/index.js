// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express application
const app = express();
const port = process.env.PORT || 5001;

// Apply middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// MongoDB connection
const uri = "mongodb+srv://auquresh:BrBB7fA9jSf4a0Pt@cluster0.dznfjm9.mongodb.net/fred";
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("Failed to connect to MongoDB", err));

// Define a schema and model for tweets
const tweetSchema = new mongoose.Schema({
  rawContent: String,
  replyCount: Number,
  retweetCount: Number,
  likeCount: Number,
  quoteCount: Number,
  hashtags: [String], // Add hashtags field if not already present
  mentions: [String], // Add mentions field if not already present
  createdAt: Date, // Ensure this field is present for time-based queries
}, { collection: 'freddy' });

const Tweet = mongoose.model('Tweet', tweetSchema);

// API endpoint to get the count of all tweets
app.get('/tweets/total', async (req, res) => {
  try {
    const totalTweets = await Tweet.countDocuments();
    res.json({ total: totalTweets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to search tweets based on a query
app.get('/tweets/search', async (req, res) => {
  const query = req.query.q;

  try {
    // Perform a regex search on the rawContent field and limit results to 25
    const tweets = await Tweet.find({ rawContent: { $regex: query, $options: 'i' } })
      .limit(25); // Limit to 25 results

    // Map the results to include only the necessary fields
    const formattedTweets = tweets.map(tweet => ({
      content: tweet.rawContent,
      user: tweet.user, // Ensure this field exists in your schema
    }));

    res.json(formattedTweets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// API endpoint to get the count of tweets from @realDonaldTrump
app.get('/tweets/donaldtrump', async (req, res) => {
  try {
    const count = await Tweet.countDocuments({ rawContent: /@realDonaldTrump/i });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to get tweet proportions
app.get('/tweets/proportion', async (req, res) => {
  try {
    const totalTweets = await Tweet.countDocuments();

    const [result] = await Tweet.aggregate([
      {
        $facet: {
          tweet: [{ $count: "count" }],
          quote: [{ $match: { quoteCount: { $gt: 0 } } }, { $count: "count" }],
          replies: [{ $match: { replyCount: { $gt: 0 } } }, { $count: "count" }],
          retweets: [{ $match: { retweetCount: { $gt: 0 } } }, { $count: "count" }]
        }
      },
      {
        $project: {
          tweet: { $arrayElemAt: ["$tweet.count", 0] },
          quote: { $arrayElemAt: ["$quote.count", 0] },
          replies: { $arrayElemAt: ["$replies.count", 0] },
          retweets: { $arrayElemAt: ["$retweets.count", 0] }
        }
      }
    ]);

    const proportions = result || { tweet: 0, quote: 0, replies: 0, retweets: 0 };

    // Adjust the tweet count to exclude the other categories
    const adjustedTweetCount = proportions.tweet - (proportions.quote + proportions.replies + proportions.retweets);

    // Calculate percentages, avoid division by zero
    const percentageProportions = {
      tweet: totalTweets > 0 ? ((adjustedTweetCount / totalTweets) * 100).toFixed(2) : "0.00",
      quote: totalTweets > 0 ? ((proportions.quote / totalTweets) * 100).toFixed(2) : "0.00",
      replies: totalTweets > 0 ? ((proportions.replies / totalTweets) * 100).toFixed(2) : "0.00",
      retweets: totalTweets > 0 ? ((proportions.retweets / totalTweets) * 100).toFixed(2) : "0.00",
    };

    res.json(percentageProportions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to get the count of tweets with social media links
app.get('/tweets/socialmedialinks', async (req, res) => {
  try {
    // Define a regex to match any URLs, which is a broader approach
    const urlRegex = /(https?:\/\/[^\s]+)/i;

    // Count documents where rawContent matches the regex
    const count = await Tweet.countDocuments({ rawContent: { $regex: urlRegex } });
    
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to get the number of tweets per hour (all tweets)
app.get('/tweets/perhour', async (req, res) => {
  try {
    // Get the current date and time
    const now = new Date();

    // Calculate the date and time 24 hours ago
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Aggregate tweets created in the last 24 hours by hour
    const tweetsPerHour = await Tweet.aggregate([
      {
        $match: {
          createdAt: { $gte: twentyFourHoursAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.hour": 1 }
      }
    ]);

    // Fill the result to ensure all 24 hours are present
    const hourlyData = Array(24).fill(0);
    tweetsPerHour.forEach(hour => {
      hourlyData[hour._id.hour] = hour.count;
    });

    const totalTweets = hourlyData.reduce((acc, curr) => acc + curr, 0);

    res.json({ hourlyData, total: totalTweets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to get tweets per hour specifically for @realDonaldTrump
app.get('/tweets/donaldtrump/perhour', async (req, res) => {
  try {
    // Get the current date and time
    const now = new Date();

    // Calculate the date and time 24 hours ago
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Aggregate tweets from @realDonaldTrump in the last 24 hours by hour
    const trumpTweetsPerHour = await Tweet.aggregate([
      {
        $match: {
          rawContent: /@realDonaldTrump/i,
          createdAt: { $gte: twentyFourHoursAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.hour": 1 }
      }
    ]);

    // Fill the result to ensure all 24 hours are present
    const hourlyData = Array(24).fill(0);
    trumpTweetsPerHour.forEach(hour => {
      hourlyData[hour._id.hour] = hour.count;
    });

    const totalTrumpTweets = hourlyData.reduce((acc, curr) => acc + curr, 0);

    res.json({ hourlyData, total: totalTrumpTweets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to get hashtags for word cloud
app.get('/tweets/hashtags', async (req, res) => {
  try {
    const hashtags = await Tweet.aggregate([
      { $unwind: "$hashtags" },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 } // Limit to top 100 hashtags
    ]);
    res.json(hashtags.map(tag => ({
      hashtag: tag._id,
      count: tag.count,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/tweets/top-mentions', async (req, res) => {
  try {
    const mentions = await Tweet.aggregate([
      { $unwind: "$mentionedUsers" }, // Unwind the mentionedUsers array
      { 
        $match: { 
          "mentionedUsers.displayname": { $ne: null }, 
          "mentionedUsers.username": { $exists: true, $ne: "" } // Ensure username exists and is not empty
        }
      },
      { 
        $group: { 
          _id: "$mentionedUsers.displayname", // Group by mentionedUsers.displayname
          count: { $sum: 1 } 
        } 
      }, 
      { $sort: { count: -1 } }, // Sort by count in descending order
      { $limit: 10 } // Limit to top 10
    ]);

    if (mentions.length === 0) {
      return res.status(404).json({ message: 'No top mentions found' });
    }

    res.json(mentions.map(mention => ({
      displayname: mention._id,
      count: mention.count,
    })));
  } catch (err) {
    console.error('Error fetching top mentions:', err);
    res.status(500).json({ error: err.message });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
