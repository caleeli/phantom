package main

import "github.com/caleeli/phantom/cli/cmd/commands"

func main() {
	cli := commands.CommandLine()
	cli.Execute()
}
