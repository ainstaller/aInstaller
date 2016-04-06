package settings

import (
	"os"
	"reflect"
	"testing"

	"github.com/UnnoTed/aInstaller/hud"
	"github.com/stretchr/testify/assert"
	"github.com/ungerik/go-dry"
)

var s = NewSettings()

func TestSave(t *testing.T) {
	var err error
	s.GamePath, err = hud.FindGame()
	assert.NoError(t, err)

	s.Hud = hud.NewHud()
	s.Hud.Colors[0] = hud.NewColor()
	s.Hud.Colors[0].Name = "health"
	s.Hud.Colors[0].Red = 100
	s.Hud.Colors[0].Green = 101
	s.Hud.Colors[0].Blue = 102
	s.Hud.Colors[0].Alpha = 103

	err = Set(s)
	assert.NoError(t, err)

	exists := dry.FileExists(file)
	assert.True(t, exists)
}

func TestLoad(t *testing.T) {
	sl, err := Get()
	assert.NoError(t, err)
	assert.NotEmpty(t, sl)
	assert.True(t, reflect.DeepEqual(s, sl))
}

func TestClean(t *testing.T) {
	if dry.FileExists(file) {
		err := os.Remove(file)
		assert.NoError(t, err)
	}
}
