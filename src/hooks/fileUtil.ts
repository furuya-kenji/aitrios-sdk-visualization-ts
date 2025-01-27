/*
 * Copyright 2023 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs'
import * as path from 'path'
import { zipSync, Zippable } from 'fflate'
import { segStringify } from './util'

export const WORK_DIR = 'work'

export function saveImage (imageData: any, subDirPath: string) {
  try {
    const { name, contents } = imageData
    const saveFilePath = path.join(subDirPath, name)
    createImageFile(saveFilePath, contents)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to save Image file.' }))
  }
}

export function saveInference (inferenceData: string, saveDirPath: string, timestamp: string) {
  const name = timestamp + '.json'
  const saveFilePath = path.join(saveDirPath, name)
  try {
    createInferencesFile(saveFilePath, inferenceData)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to save Inference file.' }))
  }
}

function removeExtension (str: string) {
  let convertedStr = str
  try {
    if (str.indexOf('.') !== -1) {
      convertedStr = str.substring(0, str.indexOf('.'))
    }
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to remove file extension.' }))
  }
  return convertedStr
}

function createImageFile (filePath: string, imageData: string) {
  try {
    fs.writeFile(filePath, imageData, { encoding: 'base64' }, (err: any) => {
      if (err) throw err
      console.log(`Image Data save in ${filePath}`)
    })
  } catch (err) {
    console.error((err as Error).message)
    throw new Error(JSON.stringify({ message: 'Fail to create Image file.' }))
  }
}

function createInferencesFile (filePath: string, inferenceData: any) {
  try {
    fs.writeFileSync(filePath, segStringify(inferenceData))
    console.log(`Inference Data save in ${filePath}`)
  } catch (err) {
    console.error((err as Error).message)
    throw new Error(JSON.stringify({ message: 'Fail to create Inference file.' }))
  }
}

export const createZipFile = async (zipDirPath: string, zipFileName: string, subDirectory: string) => {
  try {
    const target: Zippable = {}
    readFiles(target, zipDirPath, subDirectory)

    const zipData = zipSync(target)
    fs.writeFileSync(zipFileName, zipData)

    console.log(`${zipFileName} created successfully`)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Failed create zip file.' }))
  }
}

export const readZipFileData = () => {
  try {
    const filePath = fs.readdirSync(WORK_DIR)[0]
    return fs.readFileSync(path.join(WORK_DIR, filePath))
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Failed get zip data.' }))
  }
}

const readFiles = (files: Zippable, targetPath: string, saveDir: string) => {
  const list = fs.readdirSync(targetPath)

  list.forEach((flieName) => {
    const filePath = path.join(targetPath, flieName)
    if (fs.statSync(filePath).isDirectory()) {
      readFiles(files, filePath, path.join(saveDir, flieName))
    } else {
      files[path.join(saveDir, flieName)] = fs.readFileSync(filePath)
    }
  })
}

export const getTimestampFromImageFIleName = (dir: string) => {
  try {
    const fileNameList = fs.readdirSync(dir)
    const imgFileNames = fileNameList
      .filter(file => path.extname(file) === '.jpg')
      .map(file => removeExtension(file))
    return imgFileNames
  } catch (e) {
    throw new Error(JSON.stringify({ message: 'Fail to get timestamp list.' }))
  }
}
