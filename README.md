## Feed Ping Tool

API
Send a request to the /api/rss or /api/sitemap APIs with your RSS feed or XML sitemap URL using a feed URL parameter, and get a JSON response back. For example:

/api/rss?feed=https://example.com/feed/

The API takes a URL input, checks the size of the feed, then pings WebSub & Google if the feed has changed. The API stores the size of the file in memory so you can call the API server-side via a Cron job, without the risk of sending multiple pings.

A typical successful API response where the feed size is new and pings have been sent will look like this:

{
"size":123456,
"sizeChanged":true,
"webSubFetchSuccess":true,
"googlePingSuccess":true
}

If the feed size is unchanged, the response will look like this:

{
"size":123456,
"sizeChanged":false
}

If the API responds with a 500 error, or any other error message, there has been an issue with the feed or one of the API services.

Make sure you are using the feed URL parameter with the correct URL of your feed.

If you are submitting a sitemap instead of an RSS feed, you can use either API - however using the /api/sitemap API is more efficient because it only pings Google Search Console.
