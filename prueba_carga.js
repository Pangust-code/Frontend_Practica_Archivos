import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 500,          // 500 usuarios virtuales al mismo tiempo
  duration: '30s',  // Atacando sin parar durante 30 segundos
};

export default function () {
  // Atacamos a la IP pública de tu Nginx (vm-ui)
  const res = http.get('http://34.72.23.193/api/recursos');
  
  check(res, { 'El status es 200': (r) => r.status == 200 });
  // sleep(1);
}