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

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});