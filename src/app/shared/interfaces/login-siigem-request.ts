export interface LoginSiigemRequest {
    login: string;
    password: string;
}
export interface Authority {
  authority: string;
}

export interface LoginSiigemResponseData {
  id: number;
  name: string;
  authorities: Authority[];
  credentials: any;
  principal: any;
  details: any;
  simpleAuthority: string[];
  url: string[];
  token: string;
  sistema: number;
  unidad: any;
  authenticated: boolean;
  asigando: boolean;
}

export interface LoginResponse {
  data: LoginSiigemResponseData;
  success: boolean;
}
