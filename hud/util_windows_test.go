package hud

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFindSteamPath(t *testing.T) {
	path, err := FindSteamPath()
	assert.NoError(t, err)
	assert.NotEmpty(t, path)
	t.Log(path)
}

func BenchmarkFindSteamPath(b *testing.B) {
	for a := 0; a < b.N; a++ {
		_, _ = FindSteamPath()
	}
}

func TestFindSteamLibrary(t *testing.T) {
	lib, err := FindSteamLibrary()
	assert.NoError(t, err)
	assert.NotEmpty(t, lib)
	t.Log(lib)
}

func BenchmarkFindSteamLibrary(b *testing.B) {
	for a := 0; a < b.N; a++ {
		_, _ = FindSteamLibrary()
	}
}

func TestFindGame(t *testing.T) {
	gamePath, err := FindGame()
	assert.NoError(t, err)
	assert.NotEmpty(t, gamePath)
	t.Log(gamePath)
}

func BenchmarkFindGame(b *testing.B) {
	for a := 0; a < b.N; a++ {
		_, _ = FindGame()
	}
}
