package hud

import (
	"errors"
	"os"
	"regexp"
	"strings"
	"syscall"
	"time"
	"unicode/utf16"
	"unsafe"

	"github.com/mitchellh/go-ps"
	"github.com/ungerik/go-dry"
	"golang.org/x/sys/windows/registry"
)

const (
	// GamePath is the path that is added to a steam path or library
	GamePath = "steamapps/common/team fortress 2/tf/"
)

var (
	// SteamConfigLibraryExp gets library's path inside steam's config
	SteamConfigLibraryExp = regexp.MustCompile(`"BaseInstallFolder_[\d+]"[\s]+"(.*)"`)

	// GameValidFiles is a list of things that every tf2 installation must have
	GameValidFiles = []string{
		"steamapps/common/team fortress 2/hl2.exe",
		"steamapps/common/team fortress 2/tf/",
		"steamapps/common/team fortress 2/tf/cfg/",
	}

	psapi                 = syscall.NewLazyDLL("psapi.dll")
	getModuleFileNameProc = psapi.NewProc("GetProcessImageFileNameW")
)

func getModuleFileName(pid int) (string, error) {
	var n uint32
	b := make([]uint16, syscall.MAX_PATH)
	size := uint32(len(b))

	hProcess, err := syscall.OpenProcess(syscall.PROCESS_QUERY_INFORMATION, false, uint32(pid))
	if err != nil {
		return "", os.NewSyscallError("OpenProcess", err)
	}

	defer syscall.CloseHandle(hProcess)
	path, _, err := getModuleFileNameProc.Call(uintptr(hProcess), uintptr(unsafe.Pointer(&b[0])), uintptr(size))

	n = uint32(path)
	if n == 0 {
		return "", err
	}

	return string(utf16.Decode(b[0:n])), nil
}

func FindSteamPath() (string, error) {
	// get keys from steam reg
	k, err := registry.OpenKey(registry.CURRENT_USER, `SOFTWARE\Valve\Steam`, registry.QUERY_VALUE)
	if err != nil {
		return "", err
	}
	defer k.Close()

	// get Steam's path
	steamPath, _, err := k.GetStringValue("SteamPath")
	valid := isSteamPathValid(steamPath)

	// tries another method
	if !valid || (steamPath == "" && err != nil) {
		list, err := ps.Processes()
		if err != nil {
			return "", err
		}

		// loop through process list
		for _, proc := range list {
			if strings.Compare(strings.ToLower(proc.Executable()), "steam.exe") == 0 {
				// get full file path from process id
				path, err := getModuleFileName(proc.Pid())
				if err != nil {
					return "", err
				}

				path = fixSteamPath(path)
				path = findDriver(path)

				steamPath = path
				valid := isSteamPathValid(steamPath)
				if !valid {
					return "", errors.New("Error: invalid steam path.")
				}

				break
			}
		}
	}

	steamPath = fixPath(steamPath)
	return steamPath, nil
}

// FindSteamLibrary reads steam's config file from the path
// found at window's registry to get all steam libraries path
func FindSteamLibrary() ([]string, error) {
	var list []string

	steamPath, err := FindSteamPath()
	if err != nil {
		return nil, err
	}

	list = append(list, steamPath)
	configPath := steamPath + "config/config.vdf"

	// reads steam's config file to find steam libraries
	if dry.FileExists(configPath) {
		f, err := dry.FileGetString(configPath, 10*time.Second)
		if err != nil {
			return nil, err
		}

		matches := SteamConfigLibraryExp.FindAllStringSubmatch(f, -1)
		for _, m := range matches {
			list = append(list, fixPath(m[1]))
		}
	}

	return list, nil
}

// FindGame loops through steam libraries to check if the game
// is inside one of them, then it returns the valid one
func FindGame() (string, error) {
	list, err := FindSteamLibrary()
	if err != nil {
		return "", err
	}

	for _, steamLib := range list {
		valid := isSteamPathValid(steamLib)

		if valid && dry.FileExists(steamLib+GamePath) {
			return steamLib + GamePath, nil
		}
	}

	return "", errors.New("Error: not a valid game.")
}

func isSteamPathValid(s string) bool {
	s = fixPath(s)
	valid := false

	for _, file := range GameValidFiles {
		valid = dry.FileExists(s + file)
	}

	return valid
}

func findDriver(s string) string {
	list := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	drivers := strings.Split(list, "")

	for _, d := range drivers {
		path := d + `:/` + s

		if dry.FileExists(path) {
			return path
		}
	}

	return ""
}

func fixSteamPath(p string) string {
	p = strings.Replace(p, `\\`, "/", -1)
	p = strings.Replace(p, `\`, "/", -1)
	p = strings.ToLower(p)

	if strings.HasPrefix(p, "/device/") {
		list := strings.Split(p, "/")
		list = list[3 : len(list)-1]

		p = strings.Join(list, "/")
	}

	return p
}

// replaces `\\` and `\` to `/`
func fixPath(s string) string {
	s = strings.Replace(s, `\\`, "/", -1)
	s = strings.Replace(s, `\`, "/", -1)
	s = strings.ToLower(s)

	if !strings.HasSuffix(s, ".exe") && !strings.HasSuffix(s, "/") {
		s += "/"
	}

	return s
}
