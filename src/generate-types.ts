import {
	quicktype,
	JSONSchemaInput,
	FetchingJSONSchemaStore,
	InputData,
} from 'quicktype-core';
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

	console.log(lines);
	console.log(outDir);

	const dirPath = path.dirname(outDir);
	await fs.promises.mkdir(dirPath, { recursive: true });
	await fs.promises.writeFile(outDir, lines.join('\n'));
}

main();
