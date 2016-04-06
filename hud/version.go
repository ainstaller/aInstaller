package hud

import (
	"strconv"
	"strings"
	"time"
)

type Version struct {
	Year  int
	Month int
	Day   int

	Date time.Time
}

func NewVersion() *Version {
	v := new(Version)
	return v
}

func (v *Version) Parse(s string) error {
	if strings.HasPrefix(s, `v`) {
		s = strings.TrimPrefix(s, `v`)
	}

	d := strings.Split(s, `.`)

	var err error
	v.Year, err = strconv.Atoi(d[0])
	if err != nil {
		return err
	}

	v.Month, err = strconv.Atoi(d[1][0:2])
	if err != nil {
		return err
	}

	v.Day, err = strconv.Atoi(d[1][2:4])
	if err != nil {
		return err
	}

	v.Date = time.Date(v.Year, time.Month(v.Month), v.Day, 0, 0, 0, 0, time.UTC)
	return err
}

func (v *Version) GetDate() {
	v.Date = time.Date(v.Year, time.Month(v.Month), v.Day, 0, 0, 0, 0, time.UTC)
}

func (v *Version) NewerThan(v2 *Version) bool {
	return v.Date.After(v2.Date)
}

func (v *Version) OlderThan(v2 *Version) bool {
	return v.Date.Before(v2.Date)
}

func (v *Version) Equal(v2 *Version) bool {
	return v.Date.Equal(v2.Date)
}
