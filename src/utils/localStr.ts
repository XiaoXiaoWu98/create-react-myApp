import { setItem, getItem, removeItem} from 'localforage';
import { encryptByAES, decryptByAES } from './secret'

const env = process.env.NODE_ENV


/** 设置localStorage
 * @param  {string} tokenName //localStorage名称
 * @param  {string} token //localStorage数据
 * @returns string  设置的localStorage
 */
export function setLockr(tokenName: string, token: string) {
  const data = encryptByAES(token)
  setItem(`${env}_${tokenName}`, data);
}

/** 获取localStorage
 * @param  {string} tokenName //localStorage名称
 * @returns string  localStorage数据
 */
export function getLockr(tokenName: string) {
  const result = getItem(`${env}_${tokenName}`)
  return decryptByAES(result)
}

/** 移除localStorage
 * @param  {string} tokenName //localStorage名称
 */
export function removeLockr(tokenName: string) {
  removeItem(`${env}_${tokenName}`);
}
