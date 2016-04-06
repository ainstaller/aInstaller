package api

import (
	"github.com/labstack/echo"
)

func getSettings(c echo.Context) error {
	return c.JSON(200, "ayy")
}
