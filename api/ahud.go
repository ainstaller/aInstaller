package api

import (
	"errors"
	"fmt"
	"io"

	rss "github.com/jteeuwen/go-pkg-rss"
	"github.com/labstack/echo"
)

const (
	ahudNewsUrl = "http://steamcommunity.com/groups/ahud/rss"
	newsTimeout = 24 * 60 // 1 day in minutes
)

func news(c echo.Context) error {
	feed := rss.New(newsTimeout, true, chanHandler, itemHandler)

	err := feed.Fetch(ahudNewsUrl, charsetReader)
	if err != nil {
		return c.JSON(500, "Error while trying to get latest ahud news")
	}

	return c.JSON(200, feed.Channels[0].Items)
}

func chanHandler(feed *rss.Feed, newchannels []*rss.Channel) {
	fmt.Printf("%d new channel(s) in %s\n", len(newchannels), feed.Url)
}

func itemHandler(feed *rss.Feed, ch *rss.Channel, newitems []*rss.Item) {
	fmt.Printf("%d new item(s) in %s\n", len(newitems), feed.Url)
}

func charsetReader(charset string, r io.Reader) (io.Reader, error) {
	if charset == "ISO-8859-1" || charset == "iso-8859-1" {
		return r, nil
	}
	return nil, errors.New("Unsupported character set encoding: " + charset)
}
