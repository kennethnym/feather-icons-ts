const { Octokit } = require("octokit")
const path = require("path")
const fs = require("fs/promises")
const prettier = require("prettier")

require("dotenv").config()

async function main() {
	const octokit = new Octokit({
		auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
	})

	const { data: iconFiles } = await octokit.rest.repos.getContent({
		owner: "feathericons",
		repo: "feather",
		path: "icons",
	})

	const iconNames = iconFiles.map(
		(file) => `"${path.basename(file.name, path.extname(file.name))}"`
	)

	const source = `declare module "feather-icons" {
		export type FeatherIconName = ${iconNames.join(" | ")}
		
		interface SvgAttributes {
		  [attr: string]: any
    }
    
    const feather: {
			icons: {
				[TName in FeatherIconName]: {
					name: TName
					contents: string
					tags: string[]
					attrs: SvgAttributes
					toSvg: (attrs: SvgAttributes) => void
				}
			}
      replace: (attrs: SvgAttributes) => void
    }
    
    export default feather;
	}`

	const formatted = prettier.format(source, {
		semi: true,
		useTabs: true,
		parser: "typescript",
	})

	await fs.writeFile(path.resolve("feather-icons.d.ts"), formatted)
}

main()
