@echo off
set AINSTALLER_EXE=aInstaller.exe

IF EXIST %AINSTALLER_EXE% (
  del %AINSTALLER_EXE%
)
@echo on

go build -o %AINSTALLER_EXE%

@echo off
IF EXIST %AINSTALLER_EXE% (
  %AINSTALLER_EXE%
)
@echo on