import {
	quicktype,
	JSONSchemaInput,
	FetchingJSONSchemaStore,
	InputData,
} from 'quicktype-core';
import prettier from 'prettier';
import axios from 'axios';
import minimist from 'minimist';
import fs from 'fs';
import path from 'path';

const argv = minimist(process.argv.slice(2));

async function quicktypeJSONSchema(targetLanguage: string, schemas: string[]) {
	const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
	await schemaInput.addSource({
		name: 'events',
		uris: schemas,
	});

	const inputData = new InputData();
	inputData.addInput(schemaInput);

	return await quicktype({
		inputData,
		lang: targetLanguage,
		combineClasses: false,
		rendererOptions: {
			'just-types': 'true',
			'explicit-unions': 'true',
		},
	});
}

async function main() {
	const schemaRootUri = argv['uri'];
	const schemasResponse = await axios.get(schemaRootUri);
	const schemas = schemasResponse.data.map((uri) => `${schemaRootUri}/${uri}`);
	const { lines } = await quicktypeJSONSchema('ts', schemas);

	const outDir = argv['out'] || '/code/generated/types.ts';

	const dirPath = path.dirname(outDir);
	await fs.promises.mkdir(dirPath, { recursive: true });
	const prettierOptions = {
		parser: 'typescript',
	};
	if (argv['prettierrc']) {
		Object.assign(
			prettierOptions,
			prettier.resolveConfig.sync(argv['prettierrc']) || {}
		);
	}

	const code = prettier.format(lines.join('\n'), prettierOptions);
	await fs.promises.writeFile(outDir, code);
}

main();
