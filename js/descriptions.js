let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
    const tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    writtenTweets = tweet_array.filter(function(tweet) {
        return tweet.written;
    });

    // Apply any query entered before loading finished.
    updateSearchResults();
}

function updateSearchResults() {
    const searchInput = document.getElementById('textFilter');
    const searchCount = document.getElementById('searchCount');
    const searchText = document.getElementById('searchText');
    const table = document.getElementById('tweetTable');

    const inputText = searchInput.value;
    const query = inputText.trim().toLowerCase();

    searchText.textContent = inputText;

    // Empty searches should display no rows.
    if (query === '') {
        searchCount.textContent = '0';
        table.innerHTML = '';
        return;
    }

    // Search only the user-written part, ignoring capitalization.
    const matchingTweets = writtenTweets.filter(function(tweet) {
        return tweet.writtenText.toLowerCase().includes(query);
    });

    searchCount.textContent = String(matchingTweets.length);

    const rows = matchingTweets.map(function(tweet, index) {
        return tweet.getHTMLTableRow(index + 1);
    });

    table.innerHTML = rows.join('');
}

function addEventHandlerForSearch() {
    const searchInput = document.getElementById('textFilter');

    searchInput.addEventListener('input', updateSearchResults);
}

document.addEventListener('DOMContentLoaded', function() {
    addEventHandlerForSearch();
    updateSearchResults();
    loadSavedRunkeeperTweets().then(parseTweets);
});