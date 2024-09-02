import { createFileWithDir, readFile } from "../lib/utils.js";
import { UserBalance } from "./userBalance.js";
import { UserLogin } from "./userLogin.js";

export async function GetJWT(fileName) {
  try {
    const fileBin = fileName.split(".")[0] + ".bin";
    const credsPath = process.cwd() + "/creds/";
    const credsPathX = credsPath + fileBin;
    const readCred = await readFile(credsPathX);
    if (readCred) {
      //console.log(`✅ JWT found for ${fileName}`);
      const isValid = await IsValidJWT(readCred);
      if (isValid) {
        //console.warn(`✅ Still JWT valid for ${fileName}`);
        return readCred;
      }
    }

    const usersPath = process.cwd() + "/users/" + fileName;
    const readUser = await readFile(usersPath);
    if (!readUser) {
      console.warn(`User file ${usersPath} not found`);
      return null;
    }

    //console.log(`✅ User found for ${fileName}`);
    const newJWT = await UserLogin(readUser);
    if (!newJWT || newJWT?.status !== 0 || !newJWT?.data?.access_token) {
      console.warn(`❌ Failed to get JWT for ${fileName}`);
      return null;
    }
    const saveJWT = await createFileWithDir(
      "creds",
      fileBin,
      newJWT.data.access_token
    );

    if (!saveJWT) {
      console.warn(`Failed to save JWT for ${fileName}`);
    }

    // else {
    //   console.log(`✅ JWT saved for ${fileName}`);
    // }

    return newJWT?.data?.access_token;
  } catch (_e) {
    console.error(_e);
    return null;
  }
}

export async function IsValidJWT(refreshToken) {
  try {
    const checkUser = await UserBalance(refreshToken);
    if (checkUser?.status === 0 && checkUser?.data?.available_balance != "") {
      return true;
    }

    console.warn(`❌ JWT expired for ${refreshToken}-${checkUser?.message}`);
    return false;
  } catch (_e) {
    console.error(_e);
    return false;
  }
}
