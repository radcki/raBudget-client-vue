export interface TypedResponse<T = any> extends Response {
  json<P = T>(): Promise<P>
}

export interface Payload {
  id: number
}

export interface ErrorMessage {
  message: string
}
