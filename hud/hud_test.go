package hud

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetVersion(t *testing.T) {
	v, err := GetVersion()
	assert.NoError(t, err)
	assert.NotNil(t, v)
}
