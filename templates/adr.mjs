import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs/promises';

const srcFilename = 'templates/adr.md';
const slugRegex = /^[a-z0-9-]{1,40}$/g;

function suggestedSlug(title) {
    return title.toLowerCase().replaceAll(' ', '-')
}

const rl = readline.createInterface({ input, output });

let title = "";
do {
    title = await rl.question('Title of your new ADR: ');
} while (!title);

let slug = suggestedSlug(title);
console.log(`Suggested slug: ${slug}`);
do {
    const answer = await rl.question('Slug of your new ADR (press Enter to accept suggestion): ');
    if(answer) {
        slug = answer
    }
} while (!slugRegex.test(slug));

rl.close();

const date = new Date().toISOString().split('T')[0];
const destFilename = `adrs/${date}-${slug}.md`;

let srcContent = await fs.readFile(srcFilename, {encoding: 'utf8'});
srcContent = srcContent.replace('{title}', title);
await fs.writeFile(destFilename, srcContent, {encoding: 'utf8'});

console.log(`Done! The ADR template has been copied to ${destFilename}`);
