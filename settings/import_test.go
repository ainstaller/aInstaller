package settings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConvertOldColors(t *testing.T) {
	c, err := ConvertOldColor("#FF000000")
	assert.NoError(t, err)

	assert.Equal(t, 255, c.Alpha)
	assert.Equal(t, 0, c.Red)
	assert.Equal(t, 0, c.Green)
	assert.Equal(t, 0, c.Blue)

	c, err = ConvertOldColor("#38AFD355")
	assert.NoError(t, err)

	assert.Equal(t, 56, c.Alpha)
	assert.Equal(t, 175, c.Red)
	assert.Equal(t, 211, c.Green)
	assert.Equal(t, 85, c.Blue)
}
