'use strict'

const fs = require('fs')
const chalk = require('chalk')
const PATTERNS = Object.freeze({
    eslint: {
        regexp: /^.*\s*eslint-(dis|en)able\W*/gm
    }
})

class Disabled {
    constructor(rootDir = '.') {
        this.rootDir = rootDir
    }

    run() {
        const filePathList = []
        const finalReport = {}
        buildFileStructure(this.rootDir, (file) => {
            filePathList.push(file)
        })
        for (const idx in filePathList) {
            const filePath = filePathList[idx]
            let fileContents, lines, line
            try {
                fileContents = fs.readFileSync(filePath)
                lines = fileContents.toString('utf-8').split('\n')
                finalReport[filePath] = []
                for (const lIdx in lines) {
                    line = lines[lIdx]
                    const report = scanLine(line, parseInt(lIdx) + 1)
                    if (report.length > 0) {
                        finalReport[filePath].push(report)
                    }
                }
            }
            catch (error) {
                throw error
            }
        }

        // Print Report
        let issueCount = 0
        for (const key in finalReport) {
            if (finalReport[key].length > 0) {
                const filePath = key.replace(process.cwd(), '.')
                console.log(chalk`{cyan ${filePath}}`)
                for (const index in finalReport[key]) {
                    issueCount++
                    console.log(finalReport[key][index])
                }
            }
        }

        if (issueCount > 0) {
            console.log(chalk`\n{yellow {red.bold ${issueCount}} eslint ${issueCount > 1 ? 'exceptions have' : 'exception has'} been found}`)
            console.log(chalk`{magenta The linting rules should be re-evaluated for this project}\n`)
        }
        else {
            console.log(chalk`\n{green No exceptions were found!}\n`)
        }
    }
}

function buildFileStructure(dir, callback) {
    let files
    try {
        files = fs.readdirSync(dir)
        if (files) {
            for (const idx in files) {
                if (files[idx] !== 'node_modules') {
                    buildFileStructure(`${dir}/${files[idx]}`, callback)
                }
            }
        }
    }
    catch (error) {
        switch (error.code) {
            case 'ENOTDIR':
                callback(dir)
                break
            case 'ELOOP':
                console.log('Too many symbolic links... Continuing')
                break
            default:
                throw error
        }
    }
}

/* eslint-disable */
// eslint-disable other-shit
// eslint-disable-line jims-code
// eslint-disable-next-line crazy-stuff, more-crazy-stuff
/* eslint-enable */

function scanLine(line, lNum) {
    if (isComment(line)) {
        if (line.match(PATTERNS.eslint.regexp)) {
            const description = getDescription(line)
            return chalk.grey(`  Line ${lNum}: ${description}`)
        }
    }
    return ''
}

function getDescription(line) {
    if (line.includes('enable')) {
        return chalk`{green ENABLED} {white ${getRules(line)}}`
    }
    else if (line.includes('-next-line')) {
        return chalk`{red NEXT LINE DISABLED} {white ${getRules(line)}}`
    }
    else if (line.includes('-line')) {
        return chalk`{red LINE DISABLED} {white ${getRules(line)}}`
    }
    return chalk`{red DISABLED} {white ${getRules(line)}}`
}

function getRules(line) {
    const testingLine = line
        .replace('//', '')
        .replace('/*', '')
        .replace('*/', '')
        .replace('eslint-disable-next-line', '')
        .replace('eslint-disable-line', '')
        .replace('eslint-disable', '')
        .replace('eslint-enable', '')
        .replace(/\s/g, '')
        .replace(',', ', ')

    if (testingLine.length > 0) return testingLine
    return chalk.bold('EVERYTHING')
}

function isComment(line) {
    if (line.match(/^(|[\t ])\/(\/|\*)/gm)) return true
    return false
}

module.exports = Disabled
