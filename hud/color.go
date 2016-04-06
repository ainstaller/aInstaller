package hud

type Color struct {
	Name string

	Red   int
	Green int
	Blue  int

	Alpha int
}

func NewColor() *Color {
	c := new(Color)
	return c
}
