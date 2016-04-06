package hud

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVersionParse(t *testing.T) {
	v := NewVersion()
	err := v.Parse("v2016.0325")
	assert.NoError(t, err)

	assert.Equal(t, 2016, v.Year)
	assert.Equal(t, 3, v.Month)
	assert.Equal(t, 25, v.Day)

	v = NewVersion()
	err = v.Parse("2016.0220")
	assert.NoError(t, err)

	assert.Equal(t, 2016, v.Year)
	assert.Equal(t, 2, v.Month)
	assert.Equal(t, 20, v.Day)
}

func TestVersionComparison(t *testing.T) {
	v1 := NewVersion()
	err := v1.Parse("v2016.0325")
	assert.NoError(t, err)

	v2 := NewVersion()
	err = v2.Parse("v2016.0628")
	assert.NoError(t, err)

	v3 := NewVersion()
	err = v3.Parse("2016.0325")
	assert.NoError(t, err)

	assert.False(t, v1.NewerThan(v2))
	assert.True(t, v1.OlderThan(v2))

	assert.False(t, v1.Equal(v2))
	assert.True(t, v1.Equal(v1))
	assert.True(t, v1.Equal(v3))
}
