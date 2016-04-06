package hud

type Crosshair struct {
	ID        int
	Crosshair string
	Size      int

	Key   string
	Color *Color

	Enabled      bool
	Outline      bool
	AntiAliasing bool

	DamageFlash      bool
	DamageFlashColor *Color
}

func NewCrosshair() *Crosshair {
	c := new(Crosshair)
	c.Color = NewColor()
	c.DamageFlashColor = NewColor()

	return c
}
