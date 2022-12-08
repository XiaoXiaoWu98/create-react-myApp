/*
 * @Author: 伍东京 tokyoalex55@gmail.com
 * @Date: 2022-11-01 23:09:13
 * @LastEditors: 伍东京 tokyoalex55@gmail.com
 * @LastEditTime: 2022-11-17 18:43:16
 * @FilePath: \tuzhi-bill2\src\hooks\useRequest.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { message } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigurationParameters, FetchAsync } from '@api/request'
const BaseUrl = process.env.BASE_URL

const debounce = (fn: any) => {
    let timer: NodeJS.Timeout | null = null;
    return (msg: string) => {
        if (timer === null) {
            fn(msg)
            timer = setTimeout(function () {
                timer && clearTimeout(timer);
                timer = null
            }, 2000);
        }
    }
}

const defaultConfig: ConfigurationParameters = {
    baseUrl: BaseUrl + '/api',
    loginUrl: '/auth/local',
    logoutUrl: '/auth',
    errorNotify: debounce(message.error),
}

let configuration = new FetchAsync(defaultConfig)

export default function useRequest<T>(apiClasses: any[],config?: ConfigurationParameters): T {

    const navigate = useNavigate()
    const controller = new AbortController();
    if (config) configuration = new FetchAsync(Object.assign({}, defaultConfig, config))
    useEffect(() => {
        if (!configuration.goLogin)
            configuration.setGoLoginCallback(() => { navigate('/login') })
        return () => {
            controller.abort()
        }
    }, []);

    const apiConfig: any = {
       configuration,
    }

    if(process.env.NODE_EN === 'production') {
      apiConfig.signal = controller.signal
    }

    const apis = apiClasses.map((ApiClass: any) => {
      return new ApiClass(apiConfig)
    }) as T
    return apis
}


