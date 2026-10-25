function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	const tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	
	if (tweet_array.length === 0) {
		return;
	}
	// Start with the first tweet, then compare every tweet's date.
	let earliest = tweet_array[0].time;
	let latest = tweet_array[0].time;

	for (const tweet of tweet_array) {
		if (tweet.time < earliest) {
			earliest = tweet.time;
		}

		if (tweet.time > latest) {
			latest = tweet.time;
		}
	}

	// Format and display the dates.
	const dateOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	};

	document.getElementById('firstDate').textContent =
		earliest.toLocaleDateString('en-US', dateOptions);

	document.getElementById('lastDate').textContent =
		latest.toLocaleDateString('en-US', dateOptions);

	// Count tweets in each category.
	const categoryCounts = {
		completed_event: 0,
		live_event: 0,
		achievement: 0,
		miscellaneous: 0
	};

	for (const tweet of tweet_array) {
		categoryCounts[tweet.source]++;
	}

	// Match each category to its HTML class.
	const categoryClasses = {
		completed_event: 'completedEvents',
		live_event: 'liveEvents',
		achievement: 'achievements',
		miscellaneous: 'miscellaneous'
	};

	// Display counts and percentages.
	for (const category of Object.keys(categoryCounts)) {
		const count = categoryCounts[category];
		const className = categoryClasses[category];
		const percentage = (count / tweet_array.length * 100).toFixed(2);

		document.querySelectorAll('.' + className).forEach(function(element) {
			element.textContent = count;
		});

		document.querySelectorAll('.' + className + 'Pct').forEach(function(element) {
			element.textContent = percentage + '%';
		});
	}
	// Count completed activity tweets that contain written descriptions.
	const completedTweets = tweet_array.filter(function(tweet) {
		return tweet.source === 'completed_event';
	});

	const writtenTweets = completedTweets.filter(function(tweet) {
		return tweet.written;
	});

	const writtenPercentage = completedTweets.length === 0
		? '0.00'
		: (writtenTweets.length / completedTweets.length * 100).toFixed(2);

	document.querySelectorAll('.written').forEach(function(element) {
		element.textContent = writtenTweets.length;
	});

	document.querySelectorAll('.writtenPct').forEach(function(element) {
		element.textContent = writtenPercentage + '%';
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});