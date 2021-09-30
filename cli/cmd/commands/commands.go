package commands

import (
	"github.com/spf13/cobra"
)

// CobraFn function definion of run cobra command
type CobraFn func(cmd *cobra.Command, args []string)

// CommandLine cmd
func CommandLine() *cobra.Command {
	rootCmd := &cobra.Command{Use: "phantom"}
	rootCmd.AddCommand(indexCmd())
	return rootCmd
}
