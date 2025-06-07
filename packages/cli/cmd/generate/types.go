package generate

type Schema struct {
	Name       string           `json:"name"`
	DB         string           `json:"db"`
	Collection string           `json:"collection"`
	Fields     map[string]Field `json:"fields"`
	Options    Options          `json:"options"`
}

type Field struct {
	Type     string `json:"type"`
	Required bool   `json:"required"`
	Unique   bool   `json:"unique"`
	Optional bool   `json:"optional"`
}

type Options struct {
	Timestamps bool `json:"timestamps"`
}

type Config struct {
	OutputDir string   `json:"outputDir"`
	Includes  []string `json:"includes,omitempty"`
	Excludes  []string `json:"excludes,omitempty"`
}
