package settings

import (
	"encoding/hex"
	"errors"
	"strings"

	"github.com/UnnoTed/aInstaller/hud"
	"github.com/ungerik/go-dry"
)

type OldSettings struct {
	Colors            []map[string]string
	Crosshairs        []map[string]interface{}
	Scoreboard        int
	AlternativeStyle  int
	ChatPosition      int
	MedicChargeMeters int
}

func NewOldSettings() *OldSettings {
	s := new(OldSettings)
	s.Colors = make([]map[string]string, 255)
	s.Crosshairs = make([]map[string]interface{}, 255)

	return s
}

func Import(filePath string) error {
	if !dry.FileExists(filePath) {
		return errors.New("Error: The file specified doesn't exists.")
	}

	s := NewSettings()
	old := NewOldSettings()

	err := dry.FileUnmarshallJSON(filePath, &old)
	if err != nil {
		return err
	}

	s.GamePath, err = hud.FindGame()
	if err != nil {
		return err
	}

	for i, c := range old.Colors {
		s.Hud.Colors[i] = hud.NewColor()
		s.Hud.Colors[i].Name = c["Id"]

		color, err := ConvertOldColor(c["Color"])
		if err != nil {
			return err
		}

		s.Hud.Colors[i].Alpha = color.Alpha
		s.Hud.Colors[i].Green = color.Green
		s.Hud.Colors[i].Blue = color.Blue
		s.Hud.Colors[i].Red = color.Red
	}

	for i, c := range old.Crosshairs {
		s.Hud.Crosshairs[i] = hud.NewCrosshair()
		s.Hud.Crosshairs[i].AntiAliasing = c["AntiAliasing"].(bool)
		s.Hud.Crosshairs[i].Outline = c["Outline"].(bool)
		s.Hud.Crosshairs[i].Enabled = c["Enabled"].(bool)

		s.Hud.Crosshairs[i].Size = c["Size"].(int)
		s.Hud.Crosshairs[i].Key = c["Key"].(string)

		color, err := ConvertOldColor(c["Color"].(string))
		if err != nil {
			return err
		}

		s.Hud.Crosshairs[i].Color.Alpha = color.Alpha
		s.Hud.Crosshairs[i].Color.Green = color.Green
		s.Hud.Crosshairs[i].Color.Blue = color.Blue
		s.Hud.Crosshairs[i].Color.Red = color.Red

		s.Hud.Crosshairs[i].DamageFlash = c["DamageFlash"].(bool)

		flashColor, err := ConvertOldColor(c["DamageFlashColor"].(string))
		if err != nil {
			return err
		}

		s.Hud.Crosshairs[i].DamageFlashColor.Alpha = flashColor.Alpha
		s.Hud.Crosshairs[i].DamageFlashColor.Green = flashColor.Green
		s.Hud.Crosshairs[i].DamageFlashColor.Blue = flashColor.Blue
		s.Hud.Crosshairs[i].DamageFlashColor.Red = flashColor.Red
	}

	s.Hud.MedicChargeMeters = old.MedicChargeMeters
	s.Hud.AlternativeStyle = old.AlternativeStyle

	s.Hud.ChatPosition = old.ChatPosition
	s.Hud.Scoreboard = old.Scoreboard

	return Set(s)
}

func ConvertOldColor(oc string) (*hud.Color, error) {
	c := hud.NewColor()
	oc = strings.TrimPrefix(oc, `#`)

	alpha, err := hex.DecodeString(oc[0:2])
	if err != nil {
		return nil, err
	}

	red, err := hex.DecodeString(oc[2:4])
	if err != nil {
		return nil, err
	}

	green, err := hex.DecodeString(oc[4:6])
	if err != nil {
		return nil, err
	}

	blue, err := hex.DecodeString(oc[6:8])
	if err != nil {
		return nil, err
	}

	c.Alpha = int(alpha[0])
	c.Red = int(red[0])

	c.Green = int(green[0])
	c.Blue = int(blue[0])

	return c, nil
}
