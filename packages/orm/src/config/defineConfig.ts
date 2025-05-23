export type MonkoConfig = {
    /**
     * Directory to output generated types.
     * Defaults to "src/types" if not specified.
     * Example: "src/generated"
     */
    outputDir: string;
    /** 
     * Specific directories to search for schemas. 
     * If not specified, searches entire current directory.
     * Example: ["src/schemas", "lib/models"]
     */
    includes?: string[];
    /** 
     * Patterns to exclude from schema search.
     * Defaults to common build/dependency directories if not specified.
     * Example: ["**\/node_modules/**", "**\/dist/**", "**\/.next/**"]
     */
    excludes?: string[];
}

/**
 * Define the configuration for the Monko project.
 * @param config - The configuration object.
 * @returns The configuration object.
 */
export const defineConfig = (config: MonkoConfig) => {
    return config;
};