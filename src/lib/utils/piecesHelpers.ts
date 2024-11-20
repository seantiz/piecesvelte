import fs from 'fs'
import path from 'path'
import extensions from '$lib/extensions.json'

type validLanguage = keyof typeof extensions

export function sanitiseFilename (filename: string) {
    const nameWithUnderscore = filename.replace(' ', '_')
    const cleanFilename = nameWithUnderscore.replace(/[\\/*?:"<>|]/g, '')
    return cleanFilename
}

export function getFileExtension(language : string) {
    const usedLanguage = language.toLowerCase() as validLanguage
    const matchedExtension = extensions[usedLanguage]
    return matchedExtension
}

export function exportCodeToFile (code: string | Buffer, name: string, language: string) {
    const filename = sanitiseFilename(name)
    const extension = getFileExtension(language)
    const snippetsRoute = path.resolve(__dirname, '../src/lib/snippets');
    const snippetsFolder = path.join(snippetsRoute, 'openedSnippets');

    if (!fs.existsSync(snippetsFolder)) {
        fs.mkdirSync(snippetsFolder, { recursive: true });
    }

    const savedFilepath = path.join(snippetsFolder, filename, extension)

    if (typeof code === 'string') {
        fs.writeFileSync(savedFilepath, code, 'utf8')
    } else {
        const heldData = async () => Buffer.from(code)

        heldData().then( data => {
            if(Buffer.isBuffer(data))
            {
                fs.writeFileSync(savedFilepath, data)
            } else {
                throw new Error('Error buffering file data')
            }
        }).catch (error => console.log(error))
    }

}
