package api

import (
	"github.com/labstack/echo"
)

func Handlers(e *echo.Echo) *echo.Echo {
	api := e.Group("/api")
	api.Get("/news", news)
	api.Get("/settings", getSettings)

	return e
}
