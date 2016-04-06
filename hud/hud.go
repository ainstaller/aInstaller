package hud

import (
	"io/ioutil"
	"net/http"
	"regexp"
	"strconv"
)

type STATE string

const (
	// hud STATE
	UPDATED      STATE = "updated"
	OUTDATED     STATE = "outdated"
	NOTINSTALLED STATE = "notinstalled"
	CHANGED      STATE = "changed"
	OK           STATE = "ok"

	REPO          = "https://github.com/n0kk/ahud"
	DOWNLOAD      = "https://codeload.github.com/n0kk/ahud/zip/master"
	HudVersionUrl = "https://raw.githubusercontent.com/n0kk/ahud/master/resource/ui/mainmenuoverride.res"
	tfLocation    = "steamapps/common/team fortress 2/tf/"
	hudLocation   = "custom/ahud"
)

var (
	HudVersionExp = regexp.MustCompile(`"VersionLabel"[\s|\n]+{[\s\S]+"labelText"[\s]+"v(?P<year>\d+){0,4}.(?P<month>[\d+]{0,2})(?P<day>[\d+]{0,2})"`)
)

type Hud struct {
	Colors     map[int]*Color
	Crosshairs map[int]*Crosshair

	MedicChargeMeters int
	AlternativeStyle  int
	ChatPosition      int
	Scoreboard        int

	FavoriteServer string
}

func NewHud() *Hud {
	h := new(Hud)
	h.Colors = make(map[int]*Color)
	h.Crosshairs = make(map[int]*Crosshair)

	return h
}

func IsInstalled() bool {
	return false
}

func IsUpdated() bool {
	return false
}

func IsOutdated() bool {
	return !IsUpdated()
}

func IsDownloaded() bool {
	return false
}

func IsChanged() bool {
	return false
}

func GetVersion() (*Version, error) {
	res, err := http.Get(HudVersionUrl)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	data, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	m := HudVersionExp.FindStringSubmatch(string(data))
	v := NewVersion()

	date := make(map[string]string)
	for i, n := range HudVersionExp.SubexpNames() {
		if i == 0 {
			continue
		}

		date[n] = m[i]
	}

	v.Year, err = strconv.Atoi(date["year"])
	if err != nil {
		return nil, err
	}

	v.Month, err = strconv.Atoi(date["month"])
	if err != nil {
		return nil, err
	}

	v.Day, err = strconv.Atoi(date["day"])
	if err != nil {
		return nil, err
	}

	v.GetDate()

	return v, nil
}

func Download() error {

	/*f, err := os.Create(file)
	if err != nil {
		return err
	}
	defer f.Close()

	res, err := http.Get(url)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	_, err = io.Copy(f, res.Body)
	if err != nil {
		return err
	}*/

	return nil
}

func Decompress() error {
	return nil
}

// Clean removes decompressed files
func Clean() error {

	return nil
}

func Install() error {
	if !IsDownloaded() {
		return nil
	}

	return nil
}

func Uninstall() error {
	if !IsInstalled() {
		return nil
	}

	return nil
}

func State() STATE {
	installed := IsInstalled()
	updated := IsUpdated()
	changed := IsChanged()

	if !installed {
		return NOTINSTALLED
	}

	if updated {
		return UPDATED
	}

	if changed {
		return CHANGED
	}

	if installed && updated && !changed {
		return OK
	}

	return OUTDATED
}

func SetLibraryDir(dir string) error {

	return nil
}
