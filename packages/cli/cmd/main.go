package main

import (
	"fmt"
	"os"

	"github.com/monko/kit/cmd/generate"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "monko",
	Short: "High-performance developer toolkit for Monko ORM",
	Long: `Monko Kit is a fast CLI tool for generating TypeScript types from Monko ORM schemas.
	
Built with Go for maximum speed and reliability.`,
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	// Add commands
	rootCmd.AddCommand(generate.Cmd)
	rootCmd.AddCommand(initCmd)
}
