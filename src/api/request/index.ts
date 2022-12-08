import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, ParamsSerializerOptions } from 'axios'
// import jwt_decode, { JwtPayload } from 'jwt-decode'
import { transformInterceptor } from './interceptors'
import { getLockr, removeLockr, setLockr } from '@utils/localStr'
import qs from 'qs'
// export { default as useRequest, setAxiosConfig as setAxiosConfig } from './hooks/useRequest'


export type Options = AxiosRequestConfig

export interface ConfigurationParameters {
  baseUrl?: string

  updateTokenUrl?: string

  goLogin?: () => void
  //登录接口
  loginUrl?: string

  logoutUrl?: string

  errorNotify?: (msg: string) => void

  instance?: AxiosInstance
}

export class FetchAsync {

  public baseUrl: string = ''

  public updateTokenUrl?: string = ''

  public errorNotify: (msg: string) => void

  //跳转路由函数
  public goLogin?: () => void

  public loginUrl: string = ''

  public logoutUrl: string

  //设置跳转路由函数
  public setGoLogin: (() => void) | undefined

  public instance: AxiosInstance


  constructor(configuration: ConfigurationParameters) {
    this.errorNotify = configuration.errorNotify
    this.baseUrl = configuration.baseUrl;
    this.updateTokenUrl = configuration.updateTokenUrl
    this.loginUrl = configuration.loginUrl
    this.logoutUrl = configuration.logoutUrl
    this.instance = axios.create({
      timeout: 20000,
      responseType: 'json',
      paramsSerializer: {
        encode: (params) => qs.stringify(params, { arrayFormat: 'comma' })
      }
    })
    transformInterceptor(this.instance)
  }



  //设置跳转函数
  public async setGoLoginCallback(fn: () => void) {
    this.goLogin = fn;
  }

}

export class BaseAPI {

  //请求登陆后是否继续请求
  private isShowError: boolean = false

  protected signal?: AbortSignal

  private configuration: FetchAsync

  private token: string

  private tokenIsValid: boolean = false

  constructor(protected config: { configuration: FetchAsync, signal?: AbortSignal }) {
    this.configuration = config.configuration
    this.signal = config.signal
    this.token = getLockr('jwt')
  }



  // private getTokenValid() {
  //     this.token = getLockr('jwt')
  //     if (this.token !== '') {
  //         let decoded: JwtPayload;
  //         decoded = jwt_decode(this.token || '')
  //         let exp = decoded.exp as number
  //         let cur = Math.floor(Date.now() / 1000)
  //         let d = exp - cur
  //         return d
  //     } else {
  //         return -1
  //     }
  // }


  // 错误处理
  private async handleApiError(error: AxiosError) {
    const that = this;
    let code = 500
    let data: any;

    // if (axios.isCancel(error)) {
    //   return new Promise(() => { });
    // }

    if (error.response) {
      data = error.response.data
      code = error.response.status
    }
    if (code === 403) {
      that.configuration.errorNotify(data.error.message)
      return Promise.reject(error)
    }

    if ([401].includes(code)) {
      that.configuration.errorNotify('登录失效, 请重新登录!')
      if (this.isShowError) {
        return;
      }
      this.isShowError = true
      this.tokenIsValid = false
      this.token = ''
      that.configuration.goLogin && that.configuration.goLogin()
      setLockr('jwt', '')
      return Promise.reject(error)

    } else {
      let msg = '未知错误'
      const errorMsg = error.message || ''

      if (errorMsg.includes('Network Error')) {
        msg =
          '请检查网络' +
          (error.config && error.config.url
            ? error.config.url
            : JSON.stringify(error.request))
      } else if (errorMsg.includes('timeout') && errorMsg.includes('exceeded')) {
        msg = '请求超时'
      }

      if (data) {
        if (data.error.message === 'Invalid identifier or password') {
          msg = '无效的账号密码'
        } else {
          msg = data.error.message
        }
        // @ts-ignore
      }

      // @ts-ignore

      that.configuration.errorNotify(msg || '系统错误，请稍后重试')


      return Promise.reject(error)
    }
  }


  protected async request<T>(url: string, options: AxiosRequestConfig) {
    const that = this;
    let newUrl: string = '';
    if (url.indexOf('http') > -1) {
      newUrl = url
    } else {
      newUrl = this.configuration.baseUrl + url;
    }

    if (that.isShowError && url.indexOf(that.configuration.loginUrl) !== -1) {
      return null
    }
    // const d = await that.getTokenValid.call(that)

    //时间少于5分钟进行续签操作
    // if (d < 60 * 60 * 5 && d > 0 && that.configuration.updateTokenUrl) {
    //   const res = await that.request('updateTokenUrl' + `?token=${that.token}`, {}) as { jwt: string }
    //   await setLockr('jwt', '')
    //   await setLockr('jwt', res.jwt)
    //   that.token = await getLockr('jwt')
    // }

    const myInstance = that.configuration.instance || axios

    return myInstance.request<T>({
      url: newUrl,
      ...options,
      signal: this.signal,
      responseType: options.responseType || 'json'
    })
      .then((res: AxiosResponse) => {
        // @ts-ignore
        //登入
        if (url === that.configuration.loginUrl) {
          that.tokenIsValid = true
          setLockr('jwt', res.data.jwt)
          that.token = res.data.jwt
          that.isShowError = false
        }
        //登出
        if (url === that.configuration.logoutUrl) {
          removeLockr('jwt')
          that.token = ''
          that.tokenIsValid = false;
        }
        return res.data as T
      })
      .catch((err: AxiosError) => {
        that.handleApiError(err)
        throw err
      })
  }
}


