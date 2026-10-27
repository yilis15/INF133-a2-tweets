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
			"sort": activityData.map(function(activity) {
				return activity.activityType;
			}),
			"title": "Activity type"
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
			time: tweet.time.toISOString(),
			day: weekdays[tweet.time.getDay()]
		});
	}

	// Calculate mean distance for each activities.
	const activityMeans = topThreeTypes.map(function(type) {
		const records = distanceData.filter(function(record) {
			return record.activityType === type;
		});

		const total = records.reduce(function(sum, record) {
			return sum + record.distance;
		}, 0);

		return {
			activityType: type,
			count: records.length,
			meanDistance: records.length > 0 ? total / records.length : 0
		};
	}).filter(function(activity) {
		return activity.count > 0;
	});

	activityMeans.sort(function(a, b) {
		return b.meanDistance - a.meanDistance;
	});

	if (activityMeans.length > 0) {
		document.getElementById('longestActivityType').textContent =
			activityMeans[0].activityType;

		document.getElementById('shortestActivityType').textContent =
			activityMeans[activityMeans.length - 1].activityType;
	}

	// Compare mean distance per activity record on weekdays and weekends.
	const weekendRecords = distanceData.filter(function(record) {
		return record.day === 'Saturday' || record.day === 'Sunday';
	});

	const weekdayRecords = distanceData.filter(function(record) {
		return record.day !== 'Saturday' && record.day !== 'Sunday';
	});

	function meanDistance(records) {
		const total = records.reduce(function(sum, record) {
			return sum + record.distance;
		}, 0);

		return records.length > 0 ? total / records.length : null;
	}

	const weekendMean = meanDistance(weekendRecords);
	const weekdayMean = meanDistance(weekdayRecords);

	let longerPeriod = 'N/A';

	if (weekendMean !== null && weekdayMean !== null) {
		if (weekendMean > weekdayMean) {
			longerPeriod = 'weekends';
		} else if (weekdayMean > weekendMean) {
			longerPeriod = 'weekdays';
		} else {
			longerPeriod = 'weekdays and weekends equally';
		}
	}

	document.getElementById('weekdayOrWeekendLonger').textContent =
		longerPeriod;

	// Show the calculations for verification.
	console.table(activityMeans);
	console.log('Weekend mean distance:', weekendMean);
	console.log('Weekday mean distance:', weekdayMean);
	// Plot individual activity distances.
	// 1: Every tweet's distance by day.
	const distance_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Distances of the three most tweeted-about activities by day of the week.",
		"data": {
			"values": distanceData
		},
		"mark": "point",
		"encoding": {
			"x": {
				"field": "time",
				"timeUnit": "day",
				"type": "ordinal",
				"title": "time (day)"
			},
			"y": {
				"field": "distance",
				"type": "quantitative",
				"title": "distance (miles)"
			},
			"color": {
				"field": "activityType",
				"type": "nominal",
				"title": "activityType",
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

	// 2: Mean distance for each activity on each day.
	const distance_vis_aggregated_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Mean distances of the three most tweeted-about activities by day of the week.",
		"data": {
			"values": distanceData
		},
		"mark": "point",
		"encoding": {
			"x": {
				"field": "time",
				"timeUnit": "day",
				"type": "ordinal",
				"title": "time (day)"
			},
			"y": {
				"field": "distance",
				"aggregate": "mean",
				"type": "quantitative",
				"title": "Mean of distance (miles)"
			},
			"color": {
				"field": "activityType",
				"type": "nominal",
				"title": "activityType",
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
					"title": "Mean Distance (miles)",
					"format": ".2f"
				}
			]
		}
	};

	vegaEmbed('#distanceVis', distance_vis_spec, {actions: false});
	vegaEmbed(
		'#distanceVisAggregated',
		distance_vis_aggregated_spec,
		{actions: false}
	);

	// Show the first graph and hide the mean graph.
	const distanceVis = document.getElementById('distanceVis');
	const distanceVisAggregated =
		document.getElementById('distanceVisAggregated');
	const button = document.getElementById('aggregate');

	distanceVis.style.display = "block";
	distanceVisAggregated.style.display = "none";
	button.innerText = "Show means";

	// Switch graphs when the button is clicked.
	button.addEventListener('click', function() {
		if (distanceVisAggregated.style.display === "none") {
			distanceVis.style.display = "none";
			distanceVisAggregated.style.display = "block";
			button.innerText = "Show all activities";
		} else {
			distanceVis.style.display = "block";
			distanceVisAggregated.style.display = "none";
			button.innerText = "Show means";
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
