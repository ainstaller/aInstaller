package settings

import (
	"io/ioutil"

	"github.com/UnnoTed/aInstaller/hud"
	"gopkg.in/yaml.v2"
)

const (
	file = "settings.yaml"
)

type Settings struct {
	Hud      *hud.Hud
	GamePath string
	Offline  string
}

func NewSettings() *Settings {
	s := new(Settings)
	s.Hud = hud.NewHud()

	return s
}

var settings *Settings

func Set(s *Settings) error {
	settings = s
	return Save()
}

func Get() (*Settings, error) {
	var err error
	if settings == nil {
		err = Load()
	}

	return settings, err
}

func Save() error {
	data, err := yaml.Marshal(settings)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(file, data, 0777)
}

func Load() error {
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return err
	}

	err = yaml.Unmarshal(data, &settings)
	if err != nil {
		return err
	}

	return nil
}
