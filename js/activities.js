function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	const tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
    // Count completed tweets by activity type.
    const activityCounts = {};

    for (const tweet of tweet_array) {
        if (tweet.source !== 'completed_event') {
            continue;
        }

        const type = tweet.activityType;

        if (type === 'unknown') {
            continue;
        }

        if (activityCounts[type] === undefined) {
            activityCounts[type] = 0;
        }

        activityCounts[type]++;
    }

    // Convert the counts into objects for the chart.
    const activityData = Object.keys(activityCounts).map(function(type) {
        return {
            activityType: type,
            count: activityCounts[type]
        };
    });

    // Sort from most frequent to least frequent.
    activityData.sort(function(a, b) {
        return b.count - a.count;
    });

    document.getElementById('numberActivities').textContent =
        activityData.length;

    const rankingIds = ['firstMost', 'secondMost', 'thirdMost'];

    rankingIds.forEach(function(id, index) {
        document.getElementById(id).textContent =
            activityData[index] ? activityData[index].activityType : 'N/A';
    });

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityData
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {
	      "field": "activityType",
	      "type": "nominal",
	      "axis": {
	        "labelAngle": 45
	      }
	    },
	    "y": {
	      "field": "count",
	      "type": "quantitative"
	    }
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});