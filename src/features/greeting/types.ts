/** 이 feature 안에서만 쓰는 타입. 다른 feature가 필요하면 복사해 가면 됩니다. */
export interface Greeting {
  id: string
  message: string
  author: string
}
