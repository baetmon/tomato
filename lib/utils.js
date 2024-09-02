import fs from "fs"
import fsa from "fs/promises"
import path from "path"
export function ExtractUrls(text) {
  const urlPattern = /(https?:\/\/[^\s]+)/g
  const urls = text.match(urlPattern)
  return urls || []
}

export function ExtractQueryString(url) {
  const tempURL = url.replace("#tgWebAppData=", "?")
  const urlObj = new URL(tempURL)
  const params = new URLSearchParams(urlObj.search)

  const queryParams = {}

  params.forEach((value, key) => {
    queryParams[key] = value
  })

  return queryParams
}

export function ExtractAuthString(uncleanedURL) {
  const extractedUrls = ExtractUrls(uncleanedURL)

  const linkLen = extractedUrls.length

  if (linkLen === 0) return ""

  for (const link of extractedUrls) {
    const queries = ExtractQueryString(link)
    const arrQuery = Object.keys(queries)
    const findX = arrQuery.find(
      x => x.includes("%26user%3D") || x.includes("&user=")
    )
    if (findX) {
      const authx = findX.split("&tgWebAppVersion=")[0]
      return authx
    } else {
      return ""
    }
  }
  return ""
}

export function createTextFile(filename, content) {
  try {
    const filePath = path.join(process.cwd(), filename)
    fs.writeFileSync(filePath, content, "utf8")
    console.log(`File ${filename} created successfully!`)
  } catch (error) {
    console.error(`Error creating file: ${error}`)
  }
}

export function readTextFile(filename) {
  try {
    const filePath = path.join(process.cwd(), filename)
    const content = fs.readFileSync(filePath, "utf8")
    return content.replace(/\s+/g, "") // Remove all whitespace
  } catch (_error) {
    return ""
  }
}

export async function readFile(filePath) {
  try {
    const content = await fsa.readFile(filePath, "utf8")
    return content.replace(/\s+/g, "") // Remove all whitespace
  } catch (_error) {
    return ""
  }
}

export async function createFileWithDir(dirName, fileName, content) {
  try {
    const dirPath = path.join(process.cwd(), dirName)
    const filePath = path.join(dirPath, fileName)

    // Check if the directory exists
    try {
      await fsa.access(dirPath)
    } catch (error) {
      await fsa.mkdir(dirPath, { recursive: true })
      console.log(`Directory ${dirName} created.`)
    }

    // Create the file
    await fsa.writeFile(filePath, content, "utf8")
    console.log(`File ${fileName} created in directory ${dirName}.`)
    return true
  } catch (error) {
    console.error(`Error creating file: ${error}`)
    return false
  }
}

export function parseUserQuery(query) {
  const g = new URLSearchParams(query)
  const user = g.get("user")
  if (!user) {
    return null
  }
  try {
    const userz = JSON.parse(user)
    return userz
  } catch (_error) {
    return null
  }
}

export async function listTxtFiles(dirPath) {
  try {
    // Read the contents of the directory
    const files = await fsa.readdir(dirPath)

    // Filter the list of files to include only .txt files
    const txtFiles = files.filter(
      file => path.extname(file).toLowerCase() === ".txt"
    )

    // Return the list of .txt files
    return txtFiles
  } catch (error) {
    return []
  }
}

export async function deleteFile(dirPath, fileName) {
  try {
    const filePath = path.join(dirPath, fileName)

    // Check if the file exists
    await fsa.access(filePath)

    // Delete the file
    await fsa.unlink(filePath)
    console.log(`File ${fileName} deleted from directory ${dirPath}.`)
    return true
  } catch (_error) {
    return false
  }
}

export async function deleteAllFiles(dirPath) {
  try {
    // Read the contents of the directory
    const files = await fsa.readdir(dirPath)

    // Loop through all the files and delete them
    for (const file of files) {
      const filePath = path.join(dirPath, file)

      // Check if the path is a file or a directory
      const stat = await fsa.stat(filePath)
      if (stat.isFile()) {
        await fsa.unlink(filePath)
        console.log(`Deleted file: ${filePath}`)
      }
    }
    return true
  } catch (error) {
    return false
  }
}

export function getRandomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const sleep = (ms = 2000) => new Promise(r => setTimeout(r, ms))

export function chunkArray(array, chunkSize) {
  const result = []
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize))
  }
  return result
}
