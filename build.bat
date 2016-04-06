@echo off
set aName=build\aInstaller.exe
set aUpx=build\aInstaller_upx.exe

IF EXIST %aName% (
  del %aName%
)

IF EXIST %aUpx% (
  del %aUpx%
)
@echo on

go build -o %aName%

@echo off
IF EXIST %aName% (
@echo on
  %aName%
  upx -9 --best --all-methods -o %aUpx% %aName%
@echo off
)
@echo on