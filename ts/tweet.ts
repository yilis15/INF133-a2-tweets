class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        const text = this.text.trim().toLowerCase();

        if (
            text.startsWith("watch my") &&
            text.includes("right now")
        ) {
            return "live_event";
        }

        if (
            text.startsWith("achieved a new") ||
            text.startsWith("i just set a goal")
        ) {
            return "achievement";
        }

        if (
            text.startsWith("just completed") ||
            text.startsWith("just posted")
        ) {
            return "completed_event";
        }

        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        return this.writtenText.length > 0;
    }

    get writtenText():string {
    if (this.source !== "completed_event") {
        return "";
    }
    const cleanedText = this.text
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/#Runkeeper\b/gi, "")
        .trim();

    const separatorIndex = cleanedText.indexOf(" - ");

    if (separatorIndex === -1) {
        return "";
    }
    const description = cleanedText
        .slice(separatorIndex + 3)
        .trim();
    if (description.toLowerCase() === "tomtom mysports watch") {
        return "";
    }
    return description;    
}

    get activityType():string {
        if (this.source !== "completed_event") {
            return "unknown";
        }
        // Remove the opening words
        let activity = this.text.trim().toLowerCase()
            .replace(/^just (?:completed|posted) an?\s+/, "");
        // Remove distance and unit
        activity = activity.replace(/^\d+(?:\.\d+)?\s+(?:km|mi)\s+/, "");

        // Keep the activity name before duration, attribution, or description.
        activity = activity.split(
            /\s+(?:with\b|in\b|-\s|https?:\/\/|#)/
        )[0].trim();

        return activity || "unknown";
    }

    get distance():number {
        if (this.source !== "completed_event") {
            return 0;
        }
        // Read the distance
        const match = this.text.trim().match(
            /^just (?:completed|posted) an?\s+(\d+(?:\.\d+)?)\s+(km|mi)\b/i
        );
        if (match === null) {
            return 0;
        }
        const value = Number(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === "km") {
            return value / 1.609;
        }
        return value;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
    const row = document.createElement("tr");

    // First column: result number.
    const numberCell = document.createElement("th");
    numberCell.scope = "row";
    numberCell.textContent = String(rowNumber);
    row.appendChild(numberCell);

    // Second column: activity type.
    const activityCell = document.createElement("td");
    activityCell.textContent = this.activityType;
    row.appendChild(activityCell);

    // Third column: full tweet, with clickable links.
    const tweetCell = document.createElement("td");
    const parts = this.text.split(/(https?:\/\/\S+)/gi);

    for (const part of parts) {
        if (/^https?:\/\//i.test(part)) {
            const link = document.createElement("a");
            link.href = part;
            link.textContent = part;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            tweetCell.appendChild(link);
        } else {
            tweetCell.appendChild(document.createTextNode(part));
        }
    }

    row.appendChild(tweetCell);

    return row.outerHTML;
    }
}