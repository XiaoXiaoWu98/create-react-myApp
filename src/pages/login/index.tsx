import React, { useEffect } from 'react';
import { useRequest } from 'src/hooks';
import { CustomerApi, ModelApi, OrderHeaderApi } from '@api/strapi';

type IProps = {};

const Login = (props: IProps) => {
  const [orderHeaderApi, customerApi] = useRequest<
    [OrderHeaderApi, CustomerApi]
  >([OrderHeaderApi, ModelApi]);

  useEffect(() => {
    (async () => {
      const response = await customerApi.getCustomersId({ id: 7 });
    })();
  });
  return <div>Login</div>;
};

export default Login;
