import { expand } from '@emmetio/expand-abbreviation';
import resolveConfig, { EmmetConfig } from '@emmetio/config';

const defaultConfig: EmmetConfig = {
	version: 1,
	globals: {
		markup: {
			profile: {
				selfClosingStyle: 'xhtml'
			}
		}
	},
	syntax: {
		jsx: {
			type: 'markup',
			options: { jsx: true }
		}
	}
};

interface IEmAbbreviationInputProps {
	value?: string;
	syntax?: string;
	syntaxPicker: boolean;
	preview: boolean;
	config?: EmmetConfig;
}
