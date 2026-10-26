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
	const topThreeTypes = activityData.slice(0, 3).map(function(activity) {
		return activity.activityType;
	});

	const weekdays = [
		'Sunday', 'Monday', 'Tuesday', 'Wednesday',
		'Thursday', 'Friday', 'Saturday'
	];

	// Create one chart record per activity with a distance.
	const distanceData = [];

	for (const tweet of tweet_array) {
		if (tweet.source !== 'completed_event') {
			continue;
		}

		const type = tweet.activityType;
		const distance = tweet.distance;

		if (
			!topThreeTypes.includes(type) ||
			!Number.isFinite(distance) ||
			distance <= 0 ||
			Number.isNaN(tweet.time.getTime())
		) {
			continue;
		}

		distanceData.push({
			activityType: type,
			distance: distance,
			day: weekdays[tweet.time.getUTCDay()]
		});
	}

	// Plot individual activity distances.
	const distance_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Individual activity distances by day of the week.",
		"width": 500,
		"height": 300,
		"data": {
			"values": distanceData
		},
		"mark": {
			"type": "circle",
			"opacity": 0.3,
			"size": 35
		},
		"encoding": {
			"x": {
				"field": "day",
				"type": "ordinal",
				"sort": weekdays,
				"title": "Day of the week"
			},
			"y": {
				"field": "distance",
				"type": "quantitative",
				"title": "Distance (miles)",
				"scale": {
					"zero": true
				}
			},
			"color": {
				"field": "activityType",
				"type": "nominal",
				"title": "Activity type",
				"scale": {
					"domain": topThreeTypes
				}
			},
			"tooltip": [
				{
					"field": "activityType",
					"type": "nominal",
					"title": "Activity"
				},
				{
					"field": "day",
					"type": "ordinal",
					"title": "Day"
				},
				{
					"field": "distance",
					"type": "quantitative",
					"title": "Distance (miles)",
					"format": ".2f"
				}
			]
		}
	};

	vegaEmbed('#distanceVis', distance_vis_spec, {actions: false});
	// Calculate mean distance for each activity type on each weekday.
	const mean_distance_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Mean activity distance by day of the week.",
		"width": 500,
		"height": 300,
		"data": {
			"values": distanceData
		},
		"transform": [
			{
				"aggregate": [
					{
						"op": "mean",
						"field": "distance",
						"as": "meanDistance"
					}
				],
				"groupby": ["day", "activityType"]
			}
		],
		"mark": {
			"type": "circle",
			"size": 100
		},
		"encoding": {
			"x": {
				"field": "day",
				"type": "ordinal",
				"sort": weekdays,
				"title": "Day of the week"
			},
			"y": {
				"field": "meanDistance",
				"type": "quantitative",
				"title": "Mean distance (miles)",
				"scale": {
					"zero": true
				}
			},
			"color": {
				"field": "activityType",
				"type": "nominal",
				"title": "Activity type",
				"scale": {
					"domain": topThreeTypes
				}
			},
			"tooltip": [
				{
					"field": "activityType",
					"type": "nominal",
					"title": "Activity"
				},
				{
					"field": "day",
					"type": "ordinal",
					"title": "Day"
				},
				{
					"field": "meanDistance",
					"type": "quantitative",
					"title": "Mean distance (miles)",
					"format": ".2f"
				}
			]
		}
	};

	vegaEmbed(
		'#distanceVisAggregated',
		mean_distance_vis_spec,
		{actions: false}
	);
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
