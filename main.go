package main

import (
	"os"

	"github.com/UnnoTed/aInstaller/api"
	"github.com/UnnoTed/aInstaller/icon"

	"github.com/getlantern/systray"
	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/standard"
	"github.com/labstack/echo/middleware"
	"github.com/rs/cors"
	"github.com/skratchdot/open-golang/open"
	"github.com/tylerb/graceful"
)

const (
	appName = "aInstaller"
	port    = ":1337"
	url     = "127.0.0.1" + port
)

// start
func main() {
	systray.Run(onReady)
}

func onReady() {
	// system tray icon and text
	systray.SetIcon(icon.Data)
	systray.SetTitle(appName)
	systray.SetTooltip(appName)

	// commands
	mOpen := systray.AddMenuItem("Open", "Open aInstaller")
	mQuit := systray.AddMenuItem("Quit", "Close the application")

	// open url on browser
	go func() {
		open.Run("http://" + url)
	}()

	// listen to the open command
	go func() {
		<-mOpen.ClickedCh
		open.Run("http://" + url)
	}()

	// listen to the quit command
	go func() {
		<-mQuit.ClickedCh
		systray.Quit()
		os.Exit(1)
	}()

	// start web server
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(standard.WrapMiddleware(cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://localhost:3001", "http://" + url},
	}).Handler))

	e = api.Handlers(e)
	std := standard.New(port)
	std.SetHandler(e)
	graceful.ListenAndServe(std.Server, 1)
}
